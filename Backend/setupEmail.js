const { exec } = require('child_process');

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question("Enter SMTP username: ", (username) => {
  exec(`dotnet user-secrets set "Email:SmtpUsername" '${username}'`);
  readline.question("Enter SMTP password: ", (password) => {
    exec(`dotnet user-secrets set "Email:SmtpPassword" '${password}'`);
    readline.close();
  });
});
