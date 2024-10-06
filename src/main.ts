import {fetchData} from './functions';
import {UpdateResult} from './interfaces/UpdateResult';
import {UploadResult} from './interfaces/UploadResult';
import {LoginUser, UpdateUser, User} from './interfaces/User';
import {apiUrl, uploadUrl} from './variables';

// PWA code

// select forms from the DOM
const loginForm = document.querySelector(
  '#login-form'
) as HTMLFormElement | null;
const profileForm = document.querySelector(
  '#profile-form'
) as HTMLFormElement | null;
const avatarForm = document.querySelector(
  '#avatar-form'
) as HTMLFormElement | null;

// select inputs from the DOM
const usernameInput = document.querySelector(
  '#username'
) as HTMLInputElement | null;

const passwordInput = document.querySelector(
  '#password'
) as HTMLFormElement | null;

const profileUsernameInput = document.querySelector(
  '#profile-username'
) as HTMLInputElement;
const profileEmailInput = document.querySelector(
  '#profile-email'
) as HTMLInputElement | null;

// const avatarInput = document.querySelector('#avatar') as HTMLInputElement;

// select profile elements from the DOM
const usernameTarget = document.querySelector(
  '#username-target'
) as HTMLFormElement | null;
const emailTarget = document.querySelector(
  '#email-target'
) as HTMLFormElement | null;
const avatarTarget = document.querySelector(
  '#avatar-target'
) as HTMLImageElement | null;

// TODO: function to login
const login = async (): Promise<LoginUser> => {
  if (!passwordInput || !usernameInput) {
    throw new Error('No elements availaible');
  }
  const uName = usernameInput.value;
  const password = passwordInput.value;

  const data = {
    username: uName,
    password: password,
  };

  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  const loginResult = await fetchData<LoginUser>(
    apiUrl + '/auth/login',
    options
  );

  console.log(loginResult);
  return loginResult;
};

// TODO: function to update user data
const updateUserData = async (
  user: UpdateUser,
  token: string
): Promise<UpdateResult> => {
  // if (!profileUsernameInput || !profileEmailInput) {
  //   throw new Error('Ei ole elementtejä');
  // }

  const options: RequestInit = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(user),
  };

  return await fetchData<UpdateResult>(apiUrl + '/users', options);
};

// TODO: function to add userdata (email, username and avatar image) to the
// Profile DOM and Edit Profile Form
const addUserDataToDom = (user: User): void => {
  if (!emailTarget || !usernameTarget || !avatarTarget) {
    throw new Error('No elements availaible');
  }
  emailTarget.innerText = user.email;
  usernameTarget.innerText = user.username;
  avatarTarget.src = uploadUrl + user.avatar;
};

// function to get userdata from API using token
const getUserData = async (token: string): Promise<User> => {
  const options: RequestInit = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return await fetchData<User>(apiUrl + '/users/token', options);
};

// TODO: function to check local storage for token and if it exists fetch
// userdata with getUserData then update the DOM with addUserDataToDom
const checkToken = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('nöy töyken');
    return;
  }
  const user = await getUserData(token);
  addUserDataToDom(user);
};

// call checkToken on page load to check if token exists and update the DOM
checkToken();

// TODO: login form event listener
// event listener should call login function and save token to local storage
// then call addUserDataToDom to update the DOM with the user data

loginForm
  ? loginForm.addEventListener('submit', async (e) => {
      try {
        e.preventDefault();
        const loginRes = await login();
        if (loginRes) {
          console.log(loginRes);
          localStorage.setItem('token', loginRes.token);
          addUserDataToDom(loginRes.data);
        }
      } catch (err) {
        console.log((err as Error).message);
      }
    })
  : console.log('Its not there');

// TODO: profile form event listener
// event listener should call updateUserData function and update the DOM with
// the user data by calling addUserDataToDom or checkToken

profileForm
  ? profileForm.addEventListener('submit', async (e) => {
      try {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
          alert('pliis login');
          return;
        }
        if (!profileUsernameInput || !profileEmailInput) {
          throw new Error('Ei ole elementtejä');
        }
        const username = profileUsernameInput.value;
        const email = profileEmailInput.value;

        const data = {
          username,
          email,
        };
        const userResponse = await updateUserData(data, token);
        addUserDataToDom(userResponse.data);
        alert('Update OK');
      } catch (error) {
        console.log((error as Error).message);
      }
    })
  : console.log('Profileform not here');

// TODO: avatar form event listener
// event listener should call uploadAvatar function and update the DOM with
// the user data by calling addUserDataToDom or checkToken
avatarForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(avatarForm);
  const token = localStorage.getItem('token');
  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
    },
    body: fd,
  };
  const UploadResult = await fetchData<UploadResult>(
    apiUrl + '/users/avatar',
    options
  );
  console.log(UploadResult);
});
