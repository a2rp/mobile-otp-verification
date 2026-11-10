import { useEffect, useRef, useState } from "react";
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
import { auth, isFirebaseConfigured } from "./firebase/config";
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

const authErrorMessages = {
    "auth/invalid-phone-number": "Enter a valid phone number, including its country code.",
    "auth/too-many-requests": "Too many attempts. Wait a while before requesting another code.",
    "auth/quota-exceeded": "SMS verification is temporarily unavailable. Try again later.",
    "auth/operation-not-allowed": "Phone sign-in is disabled for this Firebase project.",
    "auth/unauthorized-domain": "This website domain is not allowed in the Firebase project.",
    "auth/captcha-check-failed": "The reCAPTCHA check failed. Try requesting a new code.",
    "auth/invalid-verification-code": "That code is not correct. Check it and try again.",
    "auth/code-expired": "That code has expired. Request a new one.",
    "auth/session-expired": "This verification session expired. Request a new code.",
};

const getAuthErrorMessage = (error, fallback) =>
    authErrorMessages[error?.code] || fallback;

const clearRecaptchaVerifier = (verifierRef) => {
    const verifier = verifierRef.current;
    verifierRef.current = null;
    verifier?.clear();
};

function App() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showGoTop, setShowGoTop] = useState(false);
    const recaptchaContainerRef = useRef(null);
    const recaptchaVerifierRef = useRef(null);

    const showOtpForm = confirmationResult !== null;

    useEffect(() => {
        const updateGoTop = () => setShowGoTop(window.scrollY > 420);

        window.addEventListener("scroll", updateGoTop, { passive: true });
        updateGoTop();

        return () => window.removeEventListener("scroll", updateGoTop);
    }, []);

    useEffect(
        () => () => clearRecaptchaVerifier(recaptchaVerifierRef),
        [],
    );

    const sendOTP = async () => {
        if (!isFirebaseConfigured || !auth) {
            toast.error("Set the Firebase web app values in .env.local first.");
            return;
        }

        if (!phone || phone.replace(/\D/g, "").length < 8) {
            toast.error("Enter a valid phone number.");
            return;
        }

        setLoading(true);

        try {
            if (!recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current = new RecaptchaVerifier(
                    auth,
                    recaptchaContainerRef.current,
                    {},
                );
            }

            const confirmationResult = await signInWithPhoneNumber(
                auth,
                phone,
                recaptchaVerifierRef.current,
            );
            setConfirmationResult(confirmationResult);
            setOtp("");
            clearRecaptchaVerifier(recaptchaVerifierRef);
            toast.success("OTP sent. Enter it below.");
        } catch (error) {
            clearRecaptchaVerifier(recaptchaVerifierRef);
            toast.error(
                getAuthErrorMessage(error, "Unable to send OTP. Please try again."),
            );
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        if (!confirmationResult || otp.length !== 6) {
            toast.error("Enter the OTP you received.");
            return;
        }

        setLoading(true);

        try {
            const data = await confirmationResult.confirm(otp);
            setConfirmationResult(null);
            setPhone("");
            setOtp("");
            toast.success(
                data.user
                    ? "Phone number verified."
                    : "Phone number could not be verified.",
            );
        } catch (error) {
            toast.error(
                getAuthErrorMessage(error, "Unable to verify OTP. Please try again."),
            );
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
                            {showOtpForm
                                ? "Enter your OTP"
                                : "Enter your phone number"}
                        </h2>

                        {!isFirebaseConfigured && (
                            <p className={styles.configNotice} role="status">
                                Firebase phone authentication is not configured yet.
                                Copy <code>.env.example</code> to <code>.env.local</code>
                                and add your Firebase web app values.
                            </p>
                        )}

                        {showOtpForm ? (
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
                                    inputProps={{
                                        inputMode: "numeric",
                                        maxLength: 6,
                                        autoComplete: "one-time-code",
                                        pattern: "[0-9]*",
                                    }}
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
                                        setConfirmationResult(null);
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
                                <div id="recaptcha" ref={recaptchaContainerRef} />
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{ marginTop: "15px" }}
                                    onClick={sendOTP}
                                    disabled={loading || !isFirebaseConfigured}
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
