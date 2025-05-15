import { BaseModel } from "../models/BaseModel";

export class userService {
    static async login({ username, password }: { username: string; password: string }) {
        try {
            if (!username || !password) {
                return { error: "Username and password are required", status: 400 };
            }

            const users = (await BaseModel.select(
                "usuarios",
                ["id", "nombre", "correo", "contrasena"],
                1,
                { correo: username }
            )) as { id: number; nombre: string; correo: string; contrasena: string }[];

            if (!Array.isArray(users) || users.length === 0) {
                return { error: "Invalid credentials", status: 401 };
            }

            const user = users[0];

            if ((user as { contrasena: string }).contrasena !== password) {
                return { error: "Invalid credentials", status: 401 };
            }

            return {
                message: "Login successful",
                token: "mock-token",
                status: 200,
            };
        } catch (error) {
            console.error("Error during login:", error);
            return { error: "An error occurred during login", status: 500 };
        }
    }

    static async logout() {
        try {
            return { message: "Logout successful", status: 200 };
        } catch (error) {
            return { error: "An error occurred during logout", status: 500 };
        }
    }
}
