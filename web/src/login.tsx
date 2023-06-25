import { Button, CircularProgress, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { AuthentificationModal } from "./AuthenticationModal";
import { SubmitHandler, useForm } from "react-hook-form";
import { baseUrl } from "./services/config";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
    const [submitted, setSubmitted] = useState(false);
    const [codes] = useState<string[]>(new Array(10).fill(""));
    const lastDigit = useRef(false);
    const firstTextFieldRef = useRef<HTMLInputElement>(null!);
    const secondTextFieldRef = useRef<HTMLInputElement>(null!);
    const thirdTextFieldRef = useRef<HTMLInputElement>(null!);
    const forthTextFieldRef = useRef<HTMLInputElement>(null!);
    const fifthTextFieldRef = useRef<HTMLInputElement>(null!);
    const sixthTextFieldRef = useRef<HTMLInputElement>(null!);
    const seventhTextFieldRef = useRef<HTMLInputElement>(null!);
    const eightTextFieldRef = useRef<HTMLInputElement>(null!);
    const ninethTextFieldRef = useRef<HTMLInputElement>(null!);
    const tenthTextFieldRef = useRef<HTMLInputElement>(null!);

    const refs = [firstTextFieldRef, secondTextFieldRef, thirdTextFieldRef, forthTextFieldRef, fifthTextFieldRef, sixthTextFieldRef, seventhTextFieldRef, eightTextFieldRef, ninethTextFieldRef, tenthTextFieldRef];
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<any>();
    const nav = useNavigate();

    const isDigitExpression: RegExp = /[0-9]/;

    useEffect(() => {
        refs[0].current.focus();
        for (let i = 0; i < 10; i++) {
            refs[i].current.addEventListener('keyup', keyPressCheck);
        }
    }, [])

    const keyPressCheck = (ev: KeyboardEvent) => {
        let lastNumber = 0;
        refs.forEach(ref => {
            if (ref.current.value && ref.current.value !== '') {
                lastNumber++;
            }
        });
        if (ev.code === "Backspace") {
            if (lastNumber === 9 && lastDigit.current) {
                lastDigit.current = false;
                return;
            }
            setValue(`${lastNumber - 1}`, '');
            refs[lastNumber > 0 ? lastNumber - 1 : lastNumber].current.focus();
        } else {
            if (lastNumber < 10) {
                refs[lastNumber].current.focus();
            } else {
                lastDigit.current = true;
            }
        }
    }

    const onSubmit: SubmitHandler<any> = async (data) => {
        const codes: any[] = [];
        for (let code in data) {
            codes.push(data[code]);
        }
        setSubmitted(true);
        fetch(`${baseUrl}/otp/send`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                phone: `+4${codes.join('')}`
            })
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            setSubmitted(false);
            nav("/verify-code", { state: { phone: codes.join('') } })
        })
            .catch(e => {
                console.log("internal error", e)
                setSubmitted(false);

            })
    }

    return <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", minHeight: "100%" }}>
        <AuthentificationModal>
            <div style={{ marginTop: 8, marginLeft: 24, marginRight: 24 }}>
                <p style={{ fontSize: 24, color: "black", fontWeight: "bold" }}>Confirmation</p>
                <p style={{ fontSize: 14, color: "gray" }}>Please enter your phone number to generate a verification code.</p>
                <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ flexDirection: "row" }}>
                        {codes.map((item, index) => <TextField
                            error={!!errors[String(index)]}
                            autoComplete='off'
                            key={index}
                            variant="outlined"
                            inputRef={refs[index]}
                            id="outlined-error-helper-text"
                            {...register(String(index), { required: true, pattern: isDigitExpression })}
                            inputProps={{ maxLength: 1, style: { textAlign: "center", fontSize: 20, padding: "5px" } }}
                            style={{ width: 38, marginLeft: index ? 8 : 0 }}
                        />
                        )}
                    </div>
                    <Button disabled={submitted} type="submit" variant="contained" color="primary" style={{ marginTop: 32, height: 48, borderRadius: 12, width: "90%", alignSelf: "center", fontWeight: "bold" }} >
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
