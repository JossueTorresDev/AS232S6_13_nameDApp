// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TransferContract {
    // Evento para registrar el paso de la transacción
    event TransferredThroughContract(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Recibe fondos y los transfiere inmediatamente al destinatario en la misma transacción.
     * @param recipient La dirección que recibirá los fondos.
     */
    function routeTransfer(address payable recipient) external payable {
        require(recipient != address(0), "Recipient cannot be zero address");
        require(msg.value > 0, "Must send some ETH/native token");

        // El dinero que enviaste (msg.value) se redirige inmediatamente
        (bool ok, ) = recipient.call{value: msg.value}("");
        require(ok, "Transfer failed");

        // Registramos el evento en el historial de la blockchain
        emit TransferredThroughContract(msg.sender, recipient, msg.value, block.timestamp);
    }

    // Por si alguien se equivoca y manda dinero directamente al contrato sin llamar a la función,
    // esto evitará que el dinero se quede atrapado devolviendo la transacción.
    receive() external payable {
        revert("Use routeTransfer function to pass money through");
    }
}