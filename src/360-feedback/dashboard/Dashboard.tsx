
import { observer } from "mobx-react-lite"

import AdminDashboard from "./AdminDashboard";
import { UserDashboard } from "./UsersDashboard";
import { useAppContext } from "../../shared/functions/Context";

export const Dashboard360 = observer(() => {
    const { store } = useAppContext();
    const me = store.auth.meJson;

    return (
        <div className="">
            {/* {me?.role === "Admin" ? <AdminDashboard/> : <UserDashboard/>} */}
        </div>
        
    )
})


