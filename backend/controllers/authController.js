const Signup = require("../models/Signup");
const bcrypt = require("bcryptjs");
const { generateUniqueId } = require("../utils/generateId");

const sendEmail = require("../utils/sendEmail");
const { sendOtpEmail } = require("../utils/sendEmail");

// =======================
// SIGNUP CONTROLLER
// =======================
exports.signup = async (req, res) => {
  try {
    const { name, shopname, role, email, phone, password, confirmPassword } = req.body;

    const user = await Signup.findOne({email : email});
    if(user){
      return  res.status(400).json({ message: "User with this email already exists" });
    }
    const user1 = await Signup.findOne({shopname : shopname});
     if(user1 && role==="customer"){
      return  res.status(400).json({ message: "User with this Shop Name already exists" });
    }
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUserData = {
      name,
      role,
      email,
      phone,
      password: hashedPassword,
    };

    
    if (role === "customer") {
      newUserData.shopname = shopname;
      newUserData.shopid = generateUniqueId();
    } else if (role === "admin") {
      newUserData.adminid = generateUniqueId();
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const newUser = new Signup(newUserData);
    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// =======================
// LOGIN CONTROLLER
// =======================
// LOGIN CONTROLLER — strict, deterministic
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Please provide identifier and password" });
    }

    // Normalize and detect type
    const trimmed = String(identifier).trim();
    const isEmail = trimmed.includes("@");
    const numericCandidate = Number(trimmed);
    const isNumeric = !isNaN(numericCandidate);

    let query = null;
    let matchedBy = null;

    if (isEmail) {
      // email: do case-insensitive exact match by lowercasing both sides
      query = { email: trimmed.toLowerCase() };
      matchedBy = "email";
    } else if (isNumeric) {
      // numeric: try shopid first, then adminid (explicit)
      const num = numericCandidate;
      // We'll search shopid or adminid but explicitly require exact numeric match
      query = { $or: [{ shopid: num }, { adminid: num }] };
      matchedBy = "shopid/adminid";
    } else {
      // treat as shopname (case-insensitive exact)
      // We use a case-insensitive regex that matches the whole string exactly:
      // ^...$ with i flag. This avoids partial matches.
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query = { shopname: { $regex: `^${escaped}$`, $options: "i" } };
      matchedBy = "shopname";
    }

    // If searching by email we stored emails lowercased on signup — ensure same behavior:
    // (If you did not store lowercased emails, consider modifying signup to lowercase email on save.)
    const user = await Signup.findOne(query);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // prepare safe user object and indicate which field matched
    const userSafe = user.toObject();
    delete userSafe.password;

    return res.status(200).json({
      message: "Login successful",
      matchedBy,
      user: userSafe
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// FORGOT PASSWORD - generate + email OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email, devReturnOtp } = req.body; // devReturnOtp is optional - set true while debugging

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Signup.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP as string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP and expiry (10 minutes)
    user.otp = otp; // store as string
    user.otpExpires = Date.now() + 1 * 60 * 1000;
    await user.save();

    // Debug log
    console.log(`[forgotPassword] OTP for ${email}:`, otp, "expiresAt:", new Date(user.otpExpires).toISOString());

    // Send email (await so we know if mail failed)
    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.error("[forgotPassword] sendOtpEmail error:", mailErr);
      // still allow OTP to exist — but inform client that mail failed
      return res.status(500).json({ message: "Failed to send OTP email", error: mailErr.message });
    }

    // For development/testing only: optionally return OTP in response.
    if (devReturnOtp) {
      return res.status(200).json({ message: "OTP sent (dev)", otp });
    }

    return res.status(200).json({ message: "OTP sent successfully to email" });
  } catch (err) {
    console.error("[forgotPassword] error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
// VERIFY OTP and reset password (use newPassword param)
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await Signup.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check OTP presence
    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "No OTP requested or already used" });
    }

    // Expiry check
    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Compare as strings (trim both sides to be safe)
    if (String(user.otp).trim() !== String(otp).trim()) {
      console.log(`[verifyOtp] OTP mismatch for ${email}. stored=${user.otp} given=${otp}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // If newPassword provided -> reset password now
    if (newPassword) {
      if (!confirmPassword) return res.status(400).json({ message: "confirmPassword is required" });
      if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });

      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
    }

    // Clear OTP fields
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully and password updated" });
  } catch (err) {
    console.error("[verifyOtp] error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
