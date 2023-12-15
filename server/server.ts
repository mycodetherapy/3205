import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { EventEmitter } from "events";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

let abortEmitter: EventEmitter | null = null;

interface UserData {
  email: string;
  number: string;
}

app.post("/api/search", async (req: Request, res: Response) => {
  if (abortEmitter) {
    abortEmitter.emit("abort");
  }

  const { email, number }: { email: string; number: string } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  abortEmitter = new EventEmitter();

  const timeoutId = setTimeout(() => {
    abortEmitter = null;
    const result: UserData[] = data.filter(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        (!number || user.number === number)
    );
    res.json(result);
  }, 5000);

  abortEmitter.once("abort", () => {
    clearTimeout(timeoutId);
    res.status(500).json({ error: "Request aborted" });

    //Instead of throwing an error, there may be some logic here
    throw new Error("Request aborted");
  });
});

app.listen(port, () => {
  console.log(`The server is running on port: ${port}`);
});

const data: UserData[] = [
  { email: "jim@gmail.com", number: "221122" },
  { email: "jam@gmail.com", number: "830347" },
  { email: "john@gmail.com", number: "221122" },
  { email: "jams@gmail.com", number: "349425" },
  { email: "jams@gmail.com", number: "141424" },
  { email: "jill@gmail.com", number: "822287" },
  { email: "jill@gmail.com", number: "822286" },
  { email: "john@gmail.com", number: "221122" },
];
