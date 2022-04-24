const STRIPE_KEY = require('../../config/stripe_key.json');
const stripe = require('stripe')(STRIPE_KEY['STRIPE_KEY']);

const planToPriceIds = {
    premium: 'price_1KrpkGG8hzKaSpokRAJT3c0t',
    deluxe: 'price_1KrpkkG8hzKaSpoksq5kydXm'
}

module.exports = (app) => {
    app.post('/checkout/:planName', async (req, res) => {
        const planName = req.params.planName;
        const priceId = planToPriceIds[planName];
        console.log(planName, priceId)
        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'http://localhost:5000/dashboard',
            cancel_url: 'http://localhost:5000/cancel',
        })

        res.redirect(session.url)
    })
}