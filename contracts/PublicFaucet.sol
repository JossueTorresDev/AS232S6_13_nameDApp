// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PublicFaucet
 * @notice Faucet público que permite a cualquier dirección recibir una cantidad
 *         fija de tokens nativos (ETH/SYS). El owner puede recargar el contrato
 *         y ajustar el monto por goteo y el cooldown entre solicitudes.
 */
contract PublicFaucet {
    // ── Estado ────────────────────────────────────────────────────────────────
    address public owner;
    uint256 public dripAmount;          // Wei por solicitud
    uint256 public cooldown;            // Segundos entre solicitudes por address
    uint256 public totalDripped;        // Total wei distribuido históricamente
    uint256 public totalRequests;       // Número total de solicitudes atendidas
    uint256 public totalFunded;         // Total wei recibido por recargas

    mapping(address => uint256) public lastRequest; // Timestamp de la última solicitud

    // ── Eventos ───────────────────────────────────────────────────────────────
    event FaucetDrip(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp,
        uint256 requestIndex
    );
    event FaucetFunded(address indexed funder, uint256 amount);
    event DripAmountChanged(uint256 oldAmount, uint256 newAmount);
    event CooldownChanged(uint256 oldCooldown, uint256 newCooldown);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // ── Modificadores ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────────
    /**
     * @param _dripAmount   Wei enviados por solicitud (ej: 0.01 ETH = 10000000000000000)
     * @param _cooldown     Segundos de espera entre solicitudes (ej: 86400 = 24 h)
     */
    constructor(uint256 _dripAmount, uint256 _cooldown) payable {
        owner      = msg.sender;
        dripAmount = _dripAmount;
        cooldown   = _cooldown;
    }

    // ── Lógica principal ─────────────────────────────────────────────────────

    /**
     * @notice Solicita fondos del faucet para una dirección específica.
     * @param recipient Dirección que recibirá los fondos.
     */
    function requestFunds(address payable recipient) external {
        require(recipient != address(0),  "Zero address");
        require(address(this).balance >= dripAmount, "Faucet empty");
        require(
            block.timestamp >= lastRequest[recipient] + cooldown,
            "Cooldown active"
        );

        lastRequest[recipient] = block.timestamp;
        totalDripped           += dripAmount;
        totalRequests          += 1;

        (bool ok, ) = recipient.call{value: dripAmount}("");
        require(ok, "Transfer failed");

        emit FaucetDrip(recipient, dripAmount, block.timestamp, totalRequests);
    }

    /**
     * @notice Devuelve los segundos restantes del cooldown para una address.
     *         Retorna 0 si ya puede solicitar.
     */
    function cooldownRemaining(address account) external view returns (uint256) {
        uint256 next = lastRequest[account] + cooldown;
        if (block.timestamp >= next) return 0;
        return next - block.timestamp;
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    function setDripAmount(uint256 _dripAmount) external onlyOwner {
        emit DripAmountChanged(dripAmount, _dripAmount);
        dripAmount = _dripAmount;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        emit CooldownChanged(cooldown, _cooldown);
        cooldown = _cooldown;
    }

    function withdrawAll() external onlyOwner {
        (bool ok, ) = owner.call{value: address(this).balance}("");
        require(ok, "Withdraw failed");
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // ── Recarga ──────────────────────────────────────────────────────────────

    /**
     * @notice Cualquier persona puede recargar el faucet enviando ETH con esta función.
     *         Emite FaucetFunded para que la dApp pueda mostrarlo en el historial.
     */
    function fund() external payable {
        require(msg.value > 0, "Must send ETH");
        totalFunded += msg.value;
        emit FaucetFunded(msg.sender, msg.value);
    }

    /**
     * @notice Fallback: acepta ETH enviado directamente a la dirección del contrato
     *         (por ejemplo desde MetaMask sin llamar a ninguna función).
     */
    receive() external payable {
        totalFunded += msg.value;
        emit FaucetFunded(msg.sender, msg.value);
    }

    // ── View helpers ─────────────────────────────────────────────────────────
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
