'use strict'
import {SignUp} from './components/SignUp/SignUp.js';
let app = document.getElementsByClassName("application")[0];

// const SignUpPage = {
//     page: {
//         type: "signup",
//     },
//     forms: [
//         { title: "Name", type: "text",},
//         { title: "Email", type: "email",},
//         { title: "Password", type: "password",},
//     ],
//     button: {value: "Join!", type: "submit", id: ""},
// };
// console.log(SignUpPage);
(new SignUp(app, {page: "signup",})).render()