import styles from './Header.module.css'

export default function Header() {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img 
                    src={'/images/logo.svg'}
                    alt='logo'
                />
                <nav>
                    <a>Home</a>
                    <a>Posts</a>
                </nav>
            </div>
        </header>
    )
}
