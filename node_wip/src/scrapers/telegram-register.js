import TelegramScraper from "./telegram.js";
import inquirer from "inquirer"; // Nice menus

const api = new TelegramScraper();

// NOTE
// Code from mproto-core documentation to login.
// Salts are saved to directory and this only needs to be run once
// The error in the prompt can be ignored

async function getUser() {
  try {
    const user = await api.call("users.getFullUser", {
      id: {
        _: "inputUserSelf",
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

function sendCode(phone) {
  return api.call("auth.sendCode", {
    phone_number: phone,
    settings: {
      _: "codeSettings",
    },
  });
}

function signIn({ code, phone, phone_code_hash }) {
  return api.call("auth.signIn", {
    phone_code: code,
    phone_number: phone,
    phone_code_hash: phone_code_hash,
  });
}

function signUp({ phone, phone_code_hash }) {
  return api.call("auth.signUp", {
    phone_number: phone,
    phone_code_hash: phone_code_hash,
    first_name: "MTProto",
    last_name: "Core",
  });
}

function getPassword() {
  return api.call("account.getPassword");
}

function checkPassword({ srp_id, A, M1 }) {
  return api.call("auth.checkPassword", {
    password: {
      _: "inputCheckPasswordSRP",
      srp_id,
      A,
      M1,
    },
  });
}

(async () => {
  const user = await getUser();

  let phone = "";
  let code = "";

  await inquirer
    .prompt([
      {
        type: "input",
        name: "number",
        message: "Please input your number with the country code; e.g +44XXX",
      },
    ])
    .then((answers) => {
      phone = answers.number;
    });

  if (!user) {
    const { phone_code_hash } = await sendCode(phone);

    await inquirer
    .prompt([
      {
        type: "input",
        name: "code",
        message: "Please enter your login code",
      },
    ])
    .then((answers) => {
      code = answers.code;
    });

    try {
      const signInResult = await signIn({
        code,
        phone,
        phone_code_hash,
      });

      if (signInResult._ === "auth.authorizationSignUpRequired") {
        await signUp({
          phone,
          phone_code_hash,
        });
      }
    } catch (error) {
      if (error.error_message !== "SESSION_PASSWORD_NEEDED") {
        console.log(`error:`, error);

        return;
      }

      // 2FA
      const password = "USER_PASSWORD";

      const { srp_id, current_algo, srp_B } = await getPassword();
      const { g, p, salt1, salt2 } = current_algo;

      const { A, M1 } = await api.mtproto.crypto.getSRPParams({
        g,
        p,
        salt1,
        salt2,
        gB: srp_B,
        password,
      });

      // eslint-disable-next-line no-unused-vars
      const checkPasswordResult = await checkPassword({ srp_id, A, M1 });
    }
  }
})();
