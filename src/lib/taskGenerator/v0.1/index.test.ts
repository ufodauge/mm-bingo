import { useTaskData } from "@/lib/hooks/useTaskData";
import { generateTasks } from "./index";

test("generate task test", () => {
  const taskData = useTaskData();
  const message = {
    state: "",
    value: 0,
  };
  for (let seed = 0; seed < 100000; seed++) {
    message.state = `seed: ${seed}`;
    message.value = seed;
    try {
      const [_, causedError] = generateTasks(taskData, seed, "ja");
      expect(causedError).toBe(false);
    } catch (error) {
      console.error(JSON.stringify(message, null, 2));
      throw error;
    }
  }
});
