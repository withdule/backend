import Nano from "nano";
import dotenv from "dotenv";

dotenv.config()

export default Nano(process.env.DATABASE_URL as string)