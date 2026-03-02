import bcrypt from 'bcryptjs';

export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

export async function checkPassword(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}
