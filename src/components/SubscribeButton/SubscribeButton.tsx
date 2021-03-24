import {FaGithub} from 'react-icons/fa'
import {FiX} from 'react-icons/fi'
import styles from './SubscribeButton.module.scss'

export default function SubscribebButton() {
    const isUserLoggedIn = true;
    return(
        <button
            type="button"
            className={styles.subscribeButton}
        >
            Subscribe now
        </button>
    )
}
