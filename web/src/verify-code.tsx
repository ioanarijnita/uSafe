import { Button, CircularProgress, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { AuthentificationModal } from "./AuthenticationModal";
import { SubmitHandler, useForm } from "react-hook-form";
import { baseUrl } from "./services/config";
import { useLocation, useNavigate } from "react-router-dom";
import { differenceInMilliseconds, format } from "date-fns";

export function VerifyCode(p: {setUser: (user: {accountSid: string, token: string}) => void}) {
    const [submitted, setSubmitted] = useState(false);
    const [endCountdown, setEndCountdown] = useState(new Date().setMinutes(new Date().getMinutes() + 2))
    const [codes] = useState<string[]>(new Array(6).fill(""));
    const [timeLeft, setTimeLeft] = useState(119 * 1000); // 1:59 minutes in milliseconds
    const lastDigit = useRef(false);
    const [isError, setIsError] = useState(false);
    const firstTextFieldRef = useRef<HTMLInputElement>(null!);
    const secondTextFieldRef = useRef<HTMLInputElement>(null!);
    const thirdTextFieldRef = useRef<HTMLInputElement>(null!);
    const forthTextFieldRef = useRef<HTMLInputElement>(null!);
    const fifthTextFieldRef = useRef<HTMLInputElement>(null!);
    const sixthTextFieldRef = useRef<HTMLInputElement>(null!);
    const { state } = useLocation();

    const refs = [firstTextFieldRef, secondTextFieldRef, thirdTextFieldRef, forthTextFieldRef, fifthTextFieldRef, sixthTextFieldRef];
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<any>();
    const nav = useNavigate();

    const isDigitExpression: RegExp = /[0-9]/;
    const isRedirected = state && state.phone;

    useEffect(() => {
        if (isRedirected) {
            refs[0].current.focus();
            for (let i = 0; i < 6; i++) {
                refs[i].current.addEventListener('keyup', keyPressCheck);
            }
        }
    }, [])

    useEffect(() => {
        const id = setInterval(() => {
            const countdown = differenceInMilliseconds(endCountdown, new Date());
            if (countdown < 1000) {
                setTimeLeft(0);
                clearInterval(id);
            } else {
                setTimeLeft(countdown);
            }
        }, 500);
        return () => clearInterval(id);
    }, [endCountdown])

    const keyPressCheck = (ev: KeyboardEvent) => {
        let lastNumber = 0;
        refs.forEach(ref => {
            if (ref.current.value && ref.current.value !== '') {
                lastNumber++;
            }
        });
        if (ev.code === "Backspace") {
            if (lastNumber === 5 && lastDigit.current) {
                lastDigit.current = false;
                return;
            }
            setValue(`${lastNumber - 1}`, '');
            refs[lastNumber > 0 ? lastNumber - 1 : lastNumber].current.focus();
        } else {
            if (lastNumber < 6) {
                refs[lastNumber].current.focus();
            } else {
                lastDigit.current = true;
            }
        }
    }
    if (!isRedirected) return <div></div>


    const onSubmit: SubmitHandler<any> = async (data) => {
        const codes = [];
        for (let code in data) {
            codes.push(data[code]);
        }
        setSubmitted(true);
        fetch(`${baseUrl}/otp/verify`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                phone: `+4${state.phone}`,
                otp: codes.join('')
            })
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            fetch(`${baseUrl}/otp/get-caller`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    phone: `+4${state.phone}`,
                })
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
            })
            .then(responseCaller => {
                if (responseCaller.accountSid == res.accountSid) {
                    localStorage.setItem("accountSid", res.accountSid);
                    p.setUser({accountSid: res.accountSid, token: res.token});
                    nav("/home");
                }
            })
            setSubmitted(false);
        })
            .catch(e => {
                console.log("internal error", e)
                setIsError(true);
                setSubmitted(false);

            })
    }

    const resendCode = () => {
        fetch(`${baseUrl}/otp/send`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                phone: `+4${state.phone}`
            })
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            console.log("RES", res);
            setEndCountdown(new Date().setMinutes(new Date().getMinutes() + 2));
            codes.forEach((code, idx) => {
                setValue(`${idx}`, '');
            })
            refs[0].current.focus();
            setTimeLeft(119 * 1000);
            setIsError(false);
        })
            .catch(e => {
                console.log("internal error", e)
            })
    }

    return <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", minHeight: "100%" }}>
        <AuthentificationModal>
            <div style={{ marginTop: 8, marginLeft: 24, marginRight: 24 }}>
                <p style={{ fontSize: 24, color: "black", fontWeight: "bold", textAlign: "center" }}>Verification code</p>
                <p style={{ fontSize: 14, color: "gray", textAlign: "center" }}>Please enter the code you received.</p>
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ flexDirection: "row", display: "flex", justifyContent: "center" }}>
                        {codes.map((item, index) => <TextField
                            error={!!errors[String(index)]}
                            autoComplete='off'
                            key={index}
                            variant="outlined"
                            inputRef={refs[index]}
                            id="outlined-error-helper-text"
                            {...register(String(index), { required: true, pattern: isDigitExpression })}
                            inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: 25, padding: "10px 14px" } }}
                            style={{ width: 55, marginLeft: index ? 8 : 0 }}
                        />
                        )}
                    </div>
                    <p style={{ textAlign: "center" }}>
                        The code will expire in <b>{format(timeLeft, "m:ss")}</b>
                    </p>
                    <span style={{ textAlign: "center" }}>
                        Didn't receive the code or the code has expired?
                    </span>
                    <span onClick={resendCode} style={{ textAlign: "center", cursor: "pointer", fontWeight: "bold" }}>Resend code</span>
                    {isError && <span style = {{textAlign: "center", marginTop: 12, color: "#D70040", fontWeight: "600"}}>Invalid code, please retry.</span>}
                    <Button disabled={submitted} type="submit" variant="contained" color="primary" style={{ marginTop: 24, height: 48, borderRadius: 12, width: "90%", alignSelf: "center", fontWeight: "bold" }} >
                        SEND CODE {submitted && <ButtonSpinner />}
                    </Button>
                </form>
            </div>
        </AuthentificationModal>
    </div>
}

function ButtonSpinner() {
    return <CircularProgress color="primary" size={16} style={{ marginLeft: 16 }} />
}
