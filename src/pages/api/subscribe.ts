import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/client";
import { stripe } from "../../services/stripe";
import {query as q} from 'faunadb'
import { fauna } from '../../services/fauna';

interface User{
    ref:{
        id: string
    },
    data:{
        stripe_customer_id:string
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST'){
        const session = await getSession({req}) //Retrieve data from Cookies

        
        try{
            //Obtaining user's reference by his email in faunaDB            
            const user = await fauna.query<User>(
                q.Get(
                    q.Match(
                        q.Index('user_by_email'),
                        q.Casefold(session.user.email)
                    )
                )
            )

            let customerId = user.data.stripe_customer_id
            console.log('[subscribe] Customer ID: ',customerId)
            //If user in question does not have his own Stripe Cust. Id
            if(!customerId){
                //Then... 
                console.log('[subscribe] Creating new customer')
                //Create new Stripe Customer with user's email
                const stripeCustomer = await stripe.customers.create({
                    email: session.user.email,
                    //metadata
                })
                console.log('[subscribe] Updating Faunas Collection')
                //Update faunaDB record with user's stripe Customer ID
                await fauna.query(
                    q.Update(q.Ref(q.Collection('users'),user.ref.id),{
                        data:{
                            stripe_customer_id: stripeCustomer.id,
                        }
                    })
                )
                
                // Storing recently created stripe's customer id
                customerId = stripeCustomer.id

            }

            console.log('[subscribe] Creating checkout session')
            //Create checkout session (a way for him to buy the product)
            const stripeCheckoutSession = await stripe.checkout.sessions.create({
                customer:customerId,
                payment_method_types: ['card'],
                billing_address_collection: 'required',
                line_items:[
                    {price: 'price_1IYtSkEm5Xyz87ntgyOP2sHu',quantity:1}
                ],
                mode: 'subscription',
                allow_promotion_codes: true,
                success_url: process.env.STRIPE_SUCCESS_URL,
                cancel_url: process.env.STRIPE_CANCEL_URL,
            })

            //Return success and the user's session ID
            console.log('[subscribe] Checkout session ID: ',stripeCheckoutSession.id)
            return res.status(200).json({ sessionId: stripeCheckoutSession.id})
        
        }
        catch(error){
            console.log(`[subscribe] Error while checking out of Stripe sessionr: `,error.message)  
        }

    }
    else{
        //Telling user that POST is the olny method allowed
        res.setHeader('Allow','POST')
        res.status(405).end('Method not allowed')
    }
}