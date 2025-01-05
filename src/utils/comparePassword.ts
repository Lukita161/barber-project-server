import bcrypt from 'bcrypt'


export const comparePassword = (password, hashedPassword) => {
    try {
        const isPasswordMatch = bcrypt.compare(password, hashedPassword)
        return isPasswordMatch
    } catch (error) {
        throw new Error(error)
    }
}