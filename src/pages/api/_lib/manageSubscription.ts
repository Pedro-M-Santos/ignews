import { fauna } from "../../../services/fauna";
import {query as q } from 'faunadb'
import { stripe } from "../../../services/stripe";

export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction: boolean
){
    let userRef //Will store fauna user's ref

    try{
        //getting faunaDB user's ref record
        userRef = await fauna.query(
            q.Select(
            "ref",
            q.Get(
                q.Match(
                    q.Index('user_by_stripe_customer_id'),
                    customerId
                )
                )
            )
        )

    }
    catch(error){
        console.log(`[manageSubscription]Error while trying to find user's ref ${customerId}: `,error.message)
    }
    

    try{
        //getting Stripe customer's data
        console.log(`[manageSubscription] Retrieving Stripe's SUBSCRIPTION ID`)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        // Data to be stored
        const subscriptionData = {
            id: subscription.id,
            userId: userRef,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
        }
    
        if(createAction){
            //Store new subscription data
            console.log('[manageSubscription] Creating Subscription')
            await fauna.query(
                q.Create(
                    q.Collection('subscriptions'),
                    {data: subscriptionData}
                )
            )
        }
        else{
            //Replace old subscription by newer one
            console.log(`[manageSubscription] Updating Subscription: ${subscriptionId}`)
            await  fauna.query(
                q.Replace(
                    q.Select(
                        "ref",
                        q.Get(
                            q.Match(
                                q.Index('subscription_by_id'),
                                subscriptionId
                            )
                        )
                    )
                    ,
                    {data:subscriptionData}
                )
            )
        }
    }
    catch(error){
        console.log(`[manageSubscription] Error while trying to create/replace new subscription: `,error.message)
    }

}