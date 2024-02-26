import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./screens/Dashboard";
import Orders from "./screens/Orders";
import Customers from "./screens/Customers";
import DashboardLayout from "./layout";
import MealsAndDishes from "./screens/MealsAndDishes";
import MealsView from "./dishes/MealsView";
import Tables from "./screens/Tables";
import Login from "./auth/Login";
import Home from "./client/Home";
import Cart from "./client/Cart";
import Transactions from "./transactions/Transactions";
import Staff from "./screens/Staff";
import Reports from "./reports/Reports";
import Settings from "./settings/Settings";
import Add from "./staff/Add";
import Edit from "./staff/Edit";
import { useDispatch, useSelector } from "react-redux";
import {
  markOrderCompleted,
  updateOrdersList,
} from "./redux/slices/orderSlices";
import { useEffect } from "react";
import { addEventSource } from "./redux/slices/globalSlices";
import { showTransactionStatus } from "./redux/slices/paymentSlice";
import { jwtDecode } from "jwt-decode";

//  const eventSource = new WebSocket(
//    "wss://kibandaski-restaurant-system.onrender.com/ws/sse/"
//  );


function App() {
  const dispatch = useDispatch();
  const {userInfo} = useSelector((state) => state.user);
  console.log(userInfo);
  useEffect(() => {
    const decoded = jwtDecode(userInfo.access);
    const eventSource = new WebSocket(
      `ws://127.0.0.1:8000/ws/sse/?user_id=${decoded.id}`
    );
    console.log(eventSource)
    dispatch(addEventSource(eventSource.channelName))
    eventSource.onmessage = (event) => {
      console.log("Received event:", event.data);
      // Handle the received event data as needed
      const emmittedData = JSON.parse(event.data);
      console.log(emmittedData);
      if (emmittedData?.type === "send_order") {
        dispatch(updateOrdersList(JSON.parse(emmittedData.data)));
      } else if (emmittedData?.type === "complete_order") {
        dispatch(markOrderCompleted());
      } else if (emmittedData?.type === "send_message") {
        if (emmittedData?.data.message === "Payment verified successfully!"){
          dispatch(showTransactionStatus(emmittedData?.data.message));
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("Error:", error);
      // Handle errors if necessary
    };

    // Clean up the EventSource on component unmount
    return () => {
      eventSource.close();
    };
  }, [dispatch, userInfo]);

  return (
    <Router>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/client/' element={<Home />} />
        <Route path='/client/:table_no' element={<Home />} />
        <Route path='/client/cart' element={<Cart />} />
        <Route element={<DashboardLayout />}>
          <Route path='/' element={<Dashboard />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/customers' element={<Customers />} />
          <Route path='/staff' element={<Staff />} />
          <Route path='/staff/new' element={<Add />} />
          <Route path='/staff/:id/edit' element={<Edit />} />
          <Route path='/meals-and-dishes' element={<MealsAndDishes />} />
          <Route path='/meals-and-dishes/:id' element={<MealsView />} />
          <Route path='/restaurant-tables' element={<Tables />} />
          <Route path='/transactions' element={<Transactions />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/settings' element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

// const handleSpeak = () => {
//   const text = "A new order has been made at table number 10. PLease check...";

//   const value = new SpeechSynthesisUtterance(text);
//   value.rate = 0.9;
//   window.speechSynthesis.speak(value);
// };

// useEffect(() => {
//   // Set up an interval to call handleSpeak every 5 seconds (adjust the time interval as needed)
//   const intervalId = setInterval(() => {
//     handleSpeak();
//   }, 5000); // 5000 milliseconds = 5 seconds

//   // Clean up the interval when the component is unmounted
//   return () => clearInterval(intervalId);
// }, []); // Empty dependency array ensures that the effect runs only once when the component mounts
