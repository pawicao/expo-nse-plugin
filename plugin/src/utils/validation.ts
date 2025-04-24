import { PluginPropsSchema, type PluginProps } from "./schema";
import { ZodError } from "zod";

export function validatePluginProperties(props?: PluginProps) {
  try {
    return PluginPropsSchema.parse(props);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(
        "provided expo-nse-plugin properties are invalid\n" + error.message
      );
    }
    throw error;
  }
}
