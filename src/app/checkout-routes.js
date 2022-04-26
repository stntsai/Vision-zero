const STRIPE_KEY = require('../../config/stripe_key.json');
const stripe = require('stripe')(STRIPE_KEY['STRIPE_KEY']);
const ENDPOINT_SECRET = STRIPE_KEY['ENDPOINT_SECRET'];
const authMiddleware = require('./auth-middleware');

const planToPriceIds = {
    premium: 'price_1KrpkGG8hzKaSpokRAJT3c0t',
    deluxe: 'price_1KrpkkG8hzKaSpoksq5kydXm'
}

module.exports = (app) => {
    app.post('/checkout/:planName', authMiddleware, async (req, res) => {
        const planName = req.params.planName;
        const priceId = planToPriceIds[planName];
        const user = req.user;

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:5004/',
            cancel_url: 'http://localhost:5004/pricing',
            client_reference_id: user.sub,
            // customer:
        })

        res.redirect(session.url)
    })

    app.post('/stripe-webhook', async (req, res) => {
        const payload = req.rawBody;
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, ENDPOINT_SECRET);
        } catch (err) {
            console.err('Failed to cvalidate Webhook', err)
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        const session = event.data.object;
        if (session.payment_status === 'paid') {
            const userId = session.clinet_reference_id;
            const lineItems = await stripe.checkout.sessions.listLineItems(
                session.id,
                {limit: 1}
            );
            const payment = {
                stripeCustomerId: session.customer,
                subscriptionId: session.subscription,
                priceId: lineItems.data[0].price.id
            }
            userService.updateUser(userId, {payment})
        }
        res.status(200).end()
    })
}