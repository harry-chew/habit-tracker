const { PostHog } = require('posthog-node');

const client = new PostHog(process.env.POSTHOG_API_KEY, {
    host: 'https://eu.i.posthog.com',
    persistence: 'memory', // Use in-memory persistence for testing
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
});

exports.posthogMiddleware = (req, res, next) => {
    console.log('PostHog Middleware - Request URL:', req.url, req.user?.id);
    client.capture('visit', {
        distinctId: req.user?.id ? req.user.id : 'anonymous',
        event: 'user visited page'
      });
      next();
};