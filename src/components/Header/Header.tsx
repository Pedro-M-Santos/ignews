import SignInButton from '../SignInButton'
import styles from './Header.module.scss'

export default function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img 
                    src={'/images/logo.svg'}
                    alt='logo'
                />
                <nav>
                    <a className={styles.active}>Home</a>
                    <a>Posts</a>
                </nav>
                <SignInButton />
            </div>
        </header>
    )
}
