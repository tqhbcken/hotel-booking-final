const pool = require("../config/db");
const {QUERY} = require("./querydb");


const getAll = async () => {
  const query = "SELECT * FROM Accounts";
  const [rows] = await pool.execute(query);
  return rows;
};

const getById = async (AccountID) => {
  const query = "SELECT * FROM Accounts WHERE AccountID = ?";
  const [rows] = await pool.execute(query, [AccountID]);
  return rows.length > 0 ? rows[0] : null;
};

const getByUsername = async (username) => {
  const query = "SELECT * FROM Accounts WHERE USERNAME = ?";
  const [rows] = await pool.execute(query, [username]);
  return rows.length > 0 ? rows[0] : null;
};



///create new account
const create = async (newAccount) => {
  const { username, password} = newAccount;

  const query =
    "INSERT INTO Accounts (USERNAME, PASSWORDHASH) VALUES (?,?)";
    const result = await pool.execute(query, [username, password]);
    return result[0];
};


///check account
const checkAccount = async (username) => {
  const query = "SELECT * FROM Accounts WHERE USERNAME = ?";
  const [rows, fields] = await pool.execute(query, [username]);
  return rows.length > 0 ? rows[0] : null;
};


///update account
const update = async (accountid, username, passwordhash, role) => {
  if (!accountid) {
    throw new Error("Account ID is required");
  }

  // Lấy thông tin tài khoản hiện tại để giữ lại các giá trị không thay đổi
  const currentAccount = await getById(accountid);
  if (!currentAccount) {
    throw new Error("No account found with the given ID.");
  }

  // Sử dụng giá trị mới nếu có, ngược lại giữ nguyên giá trị cũ
  const updatedUsername = username || currentAccount.USERNAME;
  const updatedPassword = passwordhash || currentAccount.PASSWORDHASH;

  // Xử lý role tương tự như trong hàm create
  let updatedRole = currentAccount.ROLE;
  if (role) {
    const formattedRole =
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    if (VALID_ROLES.includes(formattedRole)) {
      updatedRole = formattedRole;
    }
  }

  // Log để debug
  // console.log("Updating account:", {
  //   id: accountid,
  //   username: updatedUsername,
  //   passwordUpdated: passwordhash ? true : false,
  //   role: updatedRole,
  // });

  // Thực hiện truy vấn cập nhật đầy đủ các trường
  const [result] = await pool.execute(
    "UPDATE Accounts SET USERNAME = ?, PASSWORDHASH = ? WHERE ACCOUNTID = ?",
    [updatedUsername, updatedPassword, accountid]
  );

  // Kiểm tra kết quả
  if (result.affectedRows === 0) {
    throw new Error("Update failed. No account found with the given ID.");
  }

  return result;
};


const deleteAccount = async (accountid) => {
  if (!accountid) {
    throw new Error("Account ID is required");
  }
  
  const [result] = await pool.execute(
    "DELETE FROM Accounts WHERE ACCOUNTID = ?",
    [accountid]
  );
  return result;
}

const lastLogin = async (name) => {
  try {
    await pool.execute(QUERY.LASTLOGIN, [name]);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAll,
  getById,
  getByUsername,
  create,
  checkAccount,
  update,
  deleteAccount,
  lastLogin,
};
