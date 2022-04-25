const STRIPE_KEY = require('../../config/stripe_key.json');
const stripe = require('stripe')(STRIPE_KEY['STRIPE_KEY']);
const ENDPOINT_SECRET = STRIPE_KEY['ENDPOINT_SECRET'];
const authMiddleware = require('./auth-middleware');

module.exports = (app) => {
    app.post('/checkout/:planName', authMiddleware, async (req, res) => {
        const user = req.user;
        let amount = 0
        if (req.body.amount.length > 1){
            amount = parseInt(req.body.amount[0].replaceAll('.',''))
        } else {
            amount = parseInt(req.body.amount.replaceAll('.',''))
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        unit_amount: amount,
                        currency: 'usd',
                        product_data: {
                            name: 'Donation to Vision Zero',
                        }
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'http://localhost:5000/',
            cancel_url: 'http://localhost:5000/donate',
            client_reference_id: user.sub,
        });
        res.redirect(session.url)
    })

    app.post('/stripe-webhook', async (req, res) => {
        const payload = req.rawBody;
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(payload, sig, ENDPOINT_SECRET);
        } catch (err) {
            console.err('Failed to validate Webhook', err)
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