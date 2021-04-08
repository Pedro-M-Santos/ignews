import { session, useSession, signIn } from 'next-auth/client';
import { apiResolver } from 'next/dist/next-server/server/api-utils';
import {FaGithub} from 'react-icons/fa'
import {FiX} from 'react-icons/fi'
import {useRouter} from 'next/router'

import styles from './SubscribeButton.module.scss'
import {api} from '../../services/api'
import { getStripeJs } from '../../services/stripe-js';


export default function SubscribeButton() {
    const [session] = useSession()
    const router = useRouter()

    async function handleSubscribe(){
        if(!session){
            signIn('github')
            return
        }

        //Redirecting user to posts page if already has an active subscription
        if(session?.activeSubscription){
            router.push('/posts');
            return;
        }

        try{
            const response = await api.post('/subscribe')
            const {sessionId} = response.data
            const stripe = await getStripeJs()
            await stripe.redirectToCheckout({sessionId})
        }catch(error){
            console.log(error)
        }
    }

    const isUserLoggedIn = true;
    return(
        <button
            type="button"
            className={styles.subscribeButton}
            onClick={handleSubscribe}
        >
            Subscribe now
        </button>
    )
}
