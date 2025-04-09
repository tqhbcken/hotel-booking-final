const QUERY = {
  LASTLOGIN: `
        UPDATE Users 
        INNER JOIN Accounts ON Users.AccountID = Accounts.AccountID 
        SET Users.LastLogin = NOW() 
        WHERE Accounts.Username = ?
    `,
};

module.exports = {
  QUERY,
};
