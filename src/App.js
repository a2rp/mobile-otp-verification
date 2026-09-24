import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { FiCheckCircle, FiCode, FiGithub, FiGlobe, FiHeart, FiLinkedin, FiMail, FiShield, FiYoutube } from "react-icons/fi";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./styles.module.scss";

const socialLinks = [
    { label: "Portfolio", href: "https://www.ashishranjan.net/", Icon: FiGlobe }, { label: "GitHub", href: "https://github.com/a2rp", Icon: FiGithub },
    { label: "CodePen", href: "https://codepen.io/ash1198", Icon: FiCode }, { label: "LinkedIn", href: "https://www.linkedin.com/in/aashishranjan", Icon: FiLinkedin },
    { label: "YouTube", href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1", Icon: FiYoutube }, { label: "Email", href: "mailto:ash.ranjan09@gmail.com", Icon: FiMail },
    { label: "Support", href: "https://a2rp-donation-page.netlify.app/", Icon: FiHeart },
];

function App() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [enableTestOtp, setEnableTestOtp] = useState(false);
    const [loading, setLoading] = useState(false);

    const sendOTP = async () => {
        if (!phone || phone.length < 8) { toast.error("Enter a valid phone number."); return; }
        setLoading(true);
        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
            const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
            setEnableTestOtp(true);
            window.confirmationResult = confirmationResult;
            toast.success("OTP sent. Enter it below.");
        } catch (error) {
            toast.error(error.message || "Unable to send OTP.");
        } finally { setLoading(false); }
    };

    const verifyOTP = async () => {
        if (!window.confirmationResult || otp.length < 4) { toast.error("Enter the OTP you received."); return; }
        setLoading(true);
        try {
            const data = await window.confirmationResult.confirm(otp);
            toast.success(data.user ? "Phone number verified." : "Phone number could not be verified.");
        } catch (error) {
            toast.error(error.message || "Unable to verify OTP.");
        } finally { setLoading(false); }
    };

    return <div className={styles.app}><header className={styles.header}><a className={styles.brand} href="."><img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Ashish Ranjan logo" /><span><strong>OTP Verification</strong><small>Firebase phone authentication</small></span></a><span className={styles.headerStatus}><FiShield /> Secure flow</span></header><main className={styles.main}><section className={styles.card}><div className={styles.cardIntro}><span className={styles.eyebrow}><FiShield /> Phone verification</span><h1>Verify your mobile number.</h1><p>Send a one-time password and confirm the number through Firebase Authentication.</p><div className={styles.points}><span><FiCheckCircle /> SMS verification</span><span><FiCheckCircle /> Recaptcha protected</span></div></div><div className={styles.form}><h2>{enableTestOtp ? "Enter your OTP" : "Enter your phone number"}</h2>{enableTestOtp ? <><label htmlFor="otp">One-time password</label><TextField id="otp" fullWidth size="small" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} placeholder="Enter OTP" inputProps={{ inputMode: "numeric", maxLength: 6 }} /><Button variant="contained" color="success" fullWidth sx={{ marginTop: "15px" }} onClick={verifyOTP} disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</Button><button className={styles.textButton} type="button" onClick={() => { setEnableTestOtp(false); setOtp(""); }}>Use a different number</button></> : <><label htmlFor="phone">Mobile number</label><PhoneInput inputProps={{ id: "phone", required: true }} country="in" value={phone} onChange={(value) => setPhone(`+${value}`)} /><div id="recaptcha" /><Button variant="contained" fullWidth sx={{ marginTop: "15px" }} onClick={sendOTP} disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button></>}</div></section></main><footer className={styles.footer}><div className={styles.footerLinks}>{socialLinks.map(({ label, href, Icon }) => <a key={label} href={href} target={href.startsWith("mailto:") ? undefined : "_blank"} rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"} aria-label={label} title={label}><Icon /></a>)}</div><div className={styles.footerBottom}>Copyright Â© {new Date().getFullYear()} <a href="https://www.ashishranjan.net/" target="_blank" rel="noopener noreferrer">Ashish Ranjan</a></div></footer><ToastContainer position="bottom-right" /></div>;
}

export default App;