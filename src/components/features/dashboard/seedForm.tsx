import Label from "@/components/ui/label";
import TextInput from "@/components/ui/textInput";
import {
  useBingoBoardActionsContext,
  useBingoBoardValuesContext,
} from "@/contexts/bingoBoard";
import { ChangeEventHandler, memo, useCallback } from "react";

export default memo(function SeedForm() {
  const { seed }    = useBingoBoardValuesContext();
  const { setSeed } = useBingoBoardActionsContext();

  const onSeedValueChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (v) => setSeed(v.target.valueAsNumber),
    [setSeed]
  );
  return (
    <>
      <Label>Seed</Label>
      <TextInput type="number" value={seed} onChange={onSeedValueChange} />
    </>
  );
});
