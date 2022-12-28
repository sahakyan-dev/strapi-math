const _ = require('lodash');
const utils = require('@strapi/utils');
const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const emailRegExp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const jwt = require('jsonwebtoken');
const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

// validation
const { yup, validateYupSchema } = require('@strapi/utils');
const registerBodySchema = yup.object().shape({
  nickname: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().required(),
});
const updateNicknamedBodySchema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const validateRegisterBody = validateYupSchema(registerBodySchema);
const validateNicknamedBody = validateYupSchema(updateNicknamedBodySchema);

module.exports = (plugin) => {
  // JWT issuer
  const issue = (payload, jwtOptions = {}) => {
    _.defaults(jwtOptions, strapi.config.get('plugin.users-permissions.jwt'));
    return jwt.sign(
      _.clone(payload.toJSON ? payload.toJSON() : payload),
      strapi.config.get('plugin.users-permissions.jwtSecret'),
      jwtOptions
    );
  };

  // getting points controller
  plugin.controllers.user.getPoints = async (ctx) => {
    const { filters, sort, pagination } = ctx.request.query;

    return await strapi.entityService.findPage(
      'plugin::users-permissions.user',
      {
        ...(filters && {filters}),
        sort,
        page: pagination.page,
        pageSize: pagination.pageSize
      }
    );
  };

  // replacing built-in register() method with custom logics
  plugin.controllers.auth.register = async (ctx) => {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ..._.omit(ctx.request.body, [
        'confirmed',
        'confirmationToken',
        'resetPasswordToken',
      ]),
      provider: 'local',
    };

    await validateRegisterBody(params);

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      throw new ValidationError('Please provide a valid email address');
    }

    params.role = role.id;

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: params.email },
    });

    if (user && user.provider === params.provider) {
      throw new ApplicationError('Email is already taken');
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      throw new ApplicationError('Email is already taken');
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      const user = await strapi
        .query('plugin::users-permissions.user')
        .create({ data: params });

      const sanitizedUser = await sanitizeUser(user, ctx);
      console.log('user data', user);

      if (settings.email_confirmation) {
        try {
          await strapi
            .service('plugin::users-permissions.user')
            .sendConfirmationEmail(sanitizedUser);
        } catch (err) {
          throw new ApplicationError(err.message);
        }

        return ctx.send({ user: sanitizedUser });
      }

      const jwt = issue(_.pick(user, ['id']));

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (err) {
      if (_.includes(err.message, 'username')) {
        throw new ApplicationError('Username already taken');
      } else {
        throw new ApplicationError('Email already taken');
      }
    }
  };

  // register by nickname only
  plugin.controllers.auth.registerNicknamedUser = async (ctx) => {
    const pluginStore = await strapi.store({
      type: 'plugin',
      name: 'users-permissions',
    });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ..._.omit(ctx.request.body, [
        'confirmed',
        'confirmationToken',
        'resetPasswordToken',
      ]),
      provider: 'local',
      confirmed: true
    };

    if (!params.nickname) {
      throw new ApplicationError('Nickname field is required');
    }

    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { nickname: params.nickname },
    });

    if (user && user.provider === params.provider) {
      throw new ApplicationError('Nickname is already taken');
    }

    params.username = ctx.request.body.nickname;
    params.role = role.id;

    try {
      const user = await strapi
        .query('plugin::users-permissions.user')
        .create({ data: params });

      const sanitizedUser = await sanitizeUser(user, ctx);
      const jwt = issue(_.pick(user, ['id']));

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (error) {
      throw new ApplicationError(error.message);
    }
  }

  // extending of user's update() method - adding of saving course/class
  plugin.controllers.user.update = async (ctx) => {
    const data = ctx.request.body;
    let institutionId;
    let courseName = data.course?.replaceAll(' ', '').toLowerCase();

    // adding of relation to the Institution model
    if (data.institution?.name && data.institution?.place_id) {
      const institutions = await strapi.entityService.findMany('api::institution.institution');
      const institutionItem = institutions.find(item => item.place_id === data.institution.place_id);

      if (!institutionItem) {
        const entry = await strapi.entityService.create('api::institution.institution', {
          data: {
            name: data.institution.name,
            place_id: data.institution.place_id
          }
        });

        institutionId = entry.id;
      } else {
        institutionId = institutionItem.id
      }
    }

    // adding of course to institution
    if (courseName) {
      if (!data.institution.name || !data.institution.place_id) {
        throw new ApplicationError('Please fill your school/university/college before class/course');
      }

      const institutionEntry = await strapi.entityService.findOne('api::institution.institution', institutionId);

      if (!institutionEntry.courses || !institutionEntry.courses.includes(courseName)) {
        await strapi.entityService.update(
          'api::institution.institution',
          institutionId,
          {
            data: {
              courses: institutionEntry.courses ? [...institutionEntry.courses, courseName] : [courseName]
            }
          })
      }
    }

    return await strapi.entityService.update(
      'plugin::users-permissions.user',
      ctx.params.id,
      {
        data: {
          ...data,
          ...(institutionId && {institution: institutionId}),
          ...(courseName && {course: courseName})
        },
        populate: ['institution']
      }
    );
  }

  plugin.controllers.user.updateNicknamedUser = async (ctx) => {
    const data = ctx.request.body

    await validateNicknamedBody(data);

    return await strapi.entityService.update(
      'plugin::users-permissions.user',
      ctx.params.id,
      {
        data
      }
    );
  }

  plugin.controllers.user.deleteNicknamedUser = async (ctx) => {
    return await strapi.entityService.delete(
      'plugin::users-permissions.user',
      ctx.params.id,
    );
  }

  plugin.routes['content-api'].routes.push(
    {
      method: 'GET',
      path: '/get-points',
      handler: 'user.getPoints',
      config: {
        prefix: ''
      }
    },
    {
      method: 'POST',
      path: '/auth/local/register-nicknamed-user',
      handler: 'auth.registerNicknamedUser',
      config: {
        prefix: ''
      }
    },
    {
      method: 'PUT',
      path: '/users/:id/update-nicknamed-user',
      handler: 'user.updateNicknamedUser',
      config: {
        prefix: ''
      }
    },
    {
      method: 'DELETE',
      path: '/users/:id/delete-nicknamed-user',
      handler: 'user.deleteNicknamedUser',
      config: {
        prefix: ''
      }
    }
  );

  return plugin;
};
