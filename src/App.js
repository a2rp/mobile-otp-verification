import { Button, TextField } from "@mui/material";
import styles from "./styles.module.scss";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase/config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [enableTestOtp, setEnableTestOtp] = useState(false);

    const sendOTP = async () => {
        try {
            const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {});
            const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptcha);
            console.log(confirmationResult);
            const { verificationId } = confirmationResult;
            console.log(verificationId);
            // if (confirmationResult.ConfirmationResultImpl.verificationId) {
            //     setEnableTestOtp(true);
            // }
            // let code = prompt("Enter OTP");
            // if (code === null) return;
            // const isValid = await signinResult.confirm(code);
            // console.log(isValid);
            if (verificationId.length > 0) {
                setEnableTestOtp(true);
                window.confirmationResult = confirmationResult;
            }
        } catch (error) {
            console.error(error, "sendotp");
            toast(error.message);
        }
    };

    const verifyOTP = async () => {
        try {
            const data = await window.confirmationResult.confirm(otp);
            console.log(data.user);
            if (data.user) {
                toast("User verified");
            } else {
                toast("User not verified");
            }
        } catch (error) {
            console.error(error, "verifyotp");
            toast(error.message);
        }
    };

    return (
        <div className={styles.container}>
            <h3>Phone number OTP verification</h3>
            <>
                {enableTestOtp !== true
                    ? <>
                        <PhoneInput
                            style={{ marginTop: "30px" }}
                            country={"in"}
                            value={phone}
                            onChange={phone => setPhone("+" + phone)}
                        />
                        <div id="recaptcha"></div>
                        <Button variant="contained" fullWidth
                            sx={{ marginTop: "15px" }}
                            onClick={sendOTP}
                            className="sendOtpButton"
                        >Send OTP</Button>
                    </>
                    : <>
                        <TextField fullWidth
                            size="small"
                            sx={{ marginTop: "30px" }}
                            value={otp}
                            onChange={event => setOtp(event.target.value)}
                        />
                        <Button variant="contained" color="success" fullWidth
                            sx={{ marginTop: "15px" }}
                            onClick={verifyOTP}
                        >Verify OTP</Button>
                    </>}
            </>

            <ToastContainer />
        </div>
    );
}

export default App;
