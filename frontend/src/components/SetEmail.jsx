import { useState, useContext } from React;
import Context from '../Context';

const SetEmail = () => {
    const [emailInput, setEmailInput] = useState('');
    const { dispatch } = useContext(Context);
    const setEmail = () => {
        dispatch({
            type: "SET_STATE",
            state: {
                email: emailInput
            }
        });
    }
    return (
        <form>
            <label>Email</label>
            <input 
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button
              onClick={setEmail}
            >
            enter email
            </button>
        </form>
    );
}

export default SetEmail;