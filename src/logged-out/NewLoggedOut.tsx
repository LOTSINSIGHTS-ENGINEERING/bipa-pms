import { faEyeSlash, faEye, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
import { useState, FormEvent } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ErrorAlert } from "../shared/components/alert/Alert";
import ErrorBoundary from "../shared/components/error-boundary/ErrorBoundary";
import { LoadingEllipsis } from "../shared/components/loading/Loading";
import Modal from "../shared/components/Modal";
import { useAppContext } from "../shared/functions/Context";
import showModalFromId from "../shared/functions/ModalShow";
import { PASSWORD } from "./dialog/Dialogs";
import ForgotPasswordDialog from "./dialog/ForgotPasswordDialog";
import DisabledAccount from "./DisabledAccount";
import "./LoggedOut.scss";

const style = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
};

const Loader = () => {
  return (
    <div style={style}>
      <LoadingEllipsis />
    </div>
  );
};

type ILocationState = {
  from: string;
};

const LoggedOut: React.FC = observer(() => {
  const { api, store } = useAppContext();

  const location = useLocation();
  const [signInForm, setSignInForm] = useState({ email: "", password: "" });

  const [loggingloading, setLogginLoading] = useState(false);
  const [userNotFoundError, setUserNotFoundError] = useState(false);

  const [passwordType, setPasswordType] = useState("password");

  const forgotPassword = () => {
    showModalFromId(PASSWORD.FORGOT_PASSWORD_DIALOG);
  };

  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };

  const onSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLogginLoading(true);
    const { email, password = "" } = signInForm;
    const $user = await api.auth.signIn(email, password);

    if (!$user) {
      setUserNotFoundError(true);
      setLogginLoading(false);
      return;
    }
  };

  if (store.auth.loading) return <Loader />;

  if (store.auth.me && store.auth.me.asJson.disabled)
    return <DisabledAccount title={"Disabled"} />;

  if (!store.auth.loading && store.auth.me) {
    const state = location.state as ILocationState;

    if (state) return <Navigate to={state.from} />;
    return <Navigate to="/c/home/dashboard" />;
  }

  return (
    <ErrorBoundary>
      <div className="login-container" style={{ backgroundImage: 'url(/your-background-image.jpg)', backgroundSize: 'cover' }}>
        <div className="login-card">
          <div className="login-left">
            <h2>E-Performance Management System</h2>
            <p>
              Performance Management is an ongoing engagement and communication process involving the supervisor and the subordinate (employees).
            </p>
            <div className="login-illustration">
              <img src="/mqdefault.jpg" alt="Business Management Illustration" />
            </div>
          </div>

          <div className="login-right">
            {userNotFoundError && (
              <ErrorAlert
                msg="Username or password is incorrect"
                onClose={() => setUserNotFoundError(false)}
              />
            )}
            <h3>Login</h3>
            <p>Enter your details to login.</p>
            <form onSubmit={onSignIn}>
              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    value={signInForm.email}
                    onChange={(e) =>
                      setSignInForm({
                        ...signInForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon icon={faEye} className="input-icon" />
                  <input
                    type={passwordType}
                    placeholder="Enter Password"
                    value={signInForm.password}
                    onChange={(e) =>
                      setSignInForm({
                        ...signInForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <button type="button" className="toggle-password" onClick={togglePassword}>
                    <FontAwesomeIcon icon={passwordType === 'password' ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="button-container">
                <button type="submit" className="login-button">
                  Login
                  {loggingloading && <span className="loading-spinner" />}
                </button>
                <button className="login-button">
                  Forgot Password
                  {loggingloading && <span className="loading-spinner" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Modal modalId="PASSWORD.FORGOT_PASSWORD_DIALOG">
        <ForgotPasswordDialog />
      </Modal>
    </ErrorBoundary>
  );
});

export default LoggedOut;
