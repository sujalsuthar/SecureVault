import VaultGate from "../components/VaultGate";
import VaultManager from "../components/VaultManager";

function Vault() {
  return (
    <VaultGate>
      <VaultManager heading="Dedicated Vault Console" />
    </VaultGate>
  );
}

export default Vault;
