import { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import {
    FiCheckCircle,
    FiCode,
    FiGithub,
    FiGlobe,
    FiHeart,
    FiLinkedin,
    FiMail,
    FiShield,
    FiYoutube,
    FiCoffee,
    FiArrowUp,
} from "react-icons/fi";
import { SiPatreon } from "react-icons/si";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles.module.scss";

const socialLinks = [
    ["Portfolio", "https://www.ashishranjan.net/", FiGlobe],
    ["GitHub", "https://github.com/a2rp", FiGithub],
    ["CodePen", "https://codepen.io/ash1198", FiCode],
    ["LinkedIn", "https://www.linkedin.com/in/aashishranjan", FiLinkedin],
    ["Facebook", "https://www.facebook.com/theash.ashish/", FiHeart],
    ["YouTube", "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1", FiYoutube],
    ["Email", "mailto:ash.ranjan09@gmail.com", FiMail],
    ["Support", "https://a2rp-donation-page.netlify.app/", FiHeart],
    ["Buy Me a Coffee", "https://buymeacoffee.com/a2rp", FiCoffee],
    ["Patreon", "https://www.patreon.com/a2rp", SiPatreon],
];

function App() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [enableTestOtp, setEnableTestOtp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showGoTop, setShowGoTop] = useState(false);

    useEffect(() => {
        const updateGoTop = () => setShowGoTop(window.scrollY > 420);

        window.addEventListener("scroll", updateGoTop, { passive: true });
        updateGoTop();

        return () => window.removeEventListener("scroll", updateGoTop);
    }, []);

    const sendOTP = async () => {
        if (!phone || phone.length < 8) {
            toast.error("Enter a valid phone number.");
            return;
        }

        setLoading(true);

        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                phone,
                recaptcha,
            );
            setEnableTestOtp(true);
            window.confirmationResult = confirmationResult;
            toast.success("OTP sent. Enter it below.");
        } catch (error) {
            toast.error(error.message || "Unable to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!window.confirmationResult || otp.length < 4) {
            toast.error("Enter the OTP you received.");
            return;
        }

        setLoading(true);

        try {
            const data = await window.confirmationResult.confirm(otp);
            toast.success(
                data.user
                    ? "Phone number verified."
                    : "Phone number could not be verified.",
            );
        } catch (error) {
            toast.error(error.message || "Unable to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.app}>
            <header className={styles.header}>
                <a className={styles.brand} href="." aria-label="OTP verification home">
                    <img
                        src={process.env.PUBLIC_URL + "/logo.png"}
                        alt="Ashish Ranjan logo"
                    />
                    <span>
                        <strong>OTP Verification</strong>
                        <small>Firebase phone authentication</small>
                    </span>
                </a>
                <span className={styles.headerStatus}>
                    <FiShield aria-hidden="true" /> Secure flow
                </span>
            </header>

            <main className={styles.main}>
                <section className={styles.card}>
                    <div className={styles.cardIntro}>
                        <span className={styles.eyebrow}>
                            <FiShield aria-hidden="true" /> Phone verification
                        </span>
                        <h1>Verify your mobile number.</h1>
                        <p>
                            Send a one-time password and confirm the number
                            through Firebase Authentication.
                        </p>
                        <div className={styles.points}>
                            <span>
                                <FiCheckCircle aria-hidden="true" /> SMS verification
                            </span>
                            <span>
                                <FiCheckCircle aria-hidden="true" /> Recaptcha protected
                            </span>
                        </div>
                    </div>

                    <div className={styles.form}>
                        <h2>
                            {enableTestOtp
                                ? "Enter your OTP"
                                : "Enter your phone number"}
                        </h2>

                        {enableTestOtp ? (
                            <>
                                <label htmlFor="otp">One-time password</label>
                                <TextField
                                    id="otp"
                                    fullWidth
                                    size="small"
                                    value={otp}
                                    onChange={(event) =>
                                        setOtp(event.target.value.replace(/\D/g, ""))
                                    }
                                    placeholder="Enter OTP"
                                    inputProps={{ inputMode: "numeric", maxLength: 6 }}
                                />
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    sx={{ marginTop: "15px" }}
                                    onClick={verifyOTP}
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </Button>
                                <button
                                    className={styles.textButton}
                                    type="button"
                                    onClick={() => {
                                        setEnableTestOtp(false);
                                        setOtp("");
                                    }}
                                >
                                    Use a different number
                                </button>
                            </>
                        ) : (
                            <>
                                <label htmlFor="phone">Mobile number</label>
                                <PhoneInput
                                    inputProps={{ id: "phone", required: true }}
                                    country="in"
                                    value={phone}
                                    onChange={(value) => setPhone("+" + value)}
                                />
                                <div id="recaptcha" />
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ marginTop: "15px" }}
                                    onClick={sendOTP}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </Button>
                            </>
                        )}
                    </div>
                </section>
            </main>

            <footer className={styles.footer}>
                <div className={styles.footerLinks} aria-label="Social and support links">
                    {socialLinks.map(([label, href, Icon]) => (
                        <a
                            key={label}
                            href={href}
                            target={href.startsWith("mailto:") ? undefined : "_blank"}
                            rel={
                                href.startsWith("mailto:")
                                    ? undefined
                                    : "noopener noreferrer"
                            }
                            aria-label={label}
                            title={label}
                        >
                            <Icon aria-hidden="true" />
                        </a>
                    ))}
                </div>
                <div className={styles.footerBottom}>
                    Copyright &copy; {new Date().getFullYear()}{" "}
                    <a
                        href="https://www.ashishranjan.net/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Ashish Ranjan
                    </a>
                </div>
            </footer>

            {showGoTop && (
                <button
                    className={styles.goTopButton}
                    type="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    aria-label="Go to top"
                    title="Go to top"
                >
                    <FiArrowUp aria-hidden="true" />
                </button>
            )}

            <ToastContainer position="bottom-right" />
        </div>
    );
}

export default App;
