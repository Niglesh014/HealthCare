// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HospitalRBAC {

    address public receptionist;

    constructor() {
        receptionist = msg.sender;
    }

    // ================= ROLES =================

    enum Role { NONE, PATIENT, DOCTOR }

    mapping(address => Role) public roles;

    // ================= STRUCTS =================

    struct Patient {
        string name;
        uint age;
        bool registered;
    }

    struct Record {
        string diagnosis;
        string prescription;
        string ipfsHash;
        uint timestamp;
        address doctor;
    }

    // ================= STORAGE =================

    mapping(address => Patient) public patients;
    mapping(address => Record[]) private records;

    // patient => doctor => permission
    mapping(address => mapping(address => bool)) public permission;

    // patient => doctor => expiry time
    mapping(address => mapping(address => uint)) public emergencyAccess;

    // ================= EVENTS =================

    event PatientRegistered(address patient);
    event DoctorRegistered(address doctor);
    event DoctorGranted(address patient, address doctor);
    event DoctorRevoked(address patient, address doctor);
    event RecordAdded(address patient, address doctor);
    event EmergencyGranted(address patient, address doctor, uint until);
    event ReceptionistChanged(address newReceptionist);

    // ================= MODIFIERS =================

    modifier onlyReceptionist() {
        require(msg.sender == receptionist, "Access denied");
        _;
    }

    modifier onlyPatient() {
        require(roles[msg.sender] == Role.PATIENT, "Patient only");
        _;
    }

    modifier onlyDoctor() {
        require(roles[msg.sender] == Role.DOCTOR, "Doctor only");
        _;
    }

    // ================= ADMIN =================

    function changeReceptionist(address newReceptionist) public onlyReceptionist {
        require(newReceptionist != address(0), "Invalid address");
        receptionist = newReceptionist;
        emit ReceptionistChanged(newReceptionist);
    }

    // ================= REGISTRATION =================

    function registerPatient(
        address _patient,
        string memory _name,
        uint _age
    ) public onlyReceptionist {

        require(roles[_patient] == Role.NONE, "Already registered");
        require(_age > 0, "Invalid age");

        patients[_patient] = Patient(_name, _age, true);
        roles[_patient] = Role.PATIENT;

        emit PatientRegistered(_patient);
    }

    function registerDoctor(address _doctor) public onlyReceptionist {

        require(roles[_doctor] == Role.NONE, "Already registered");

        roles[_doctor] = Role.DOCTOR;

        emit DoctorRegistered(_doctor);
    }

    // ================= PATIENT ACTIONS =================

    function grantDoctor(address _doctor) public onlyPatient {
        require(roles[_doctor] == Role.DOCTOR, "Not doctor");

        permission[msg.sender][_doctor] = true;

        emit DoctorGranted(msg.sender, _doctor);
    }

    function revokeDoctor(address _doctor) public onlyPatient {
        permission[msg.sender][_doctor] = false;

        emit DoctorRevoked(msg.sender, _doctor);
    }

    function getMyRecords()
        public
        view
        onlyPatient
        returns (Record[] memory)
    {
        return records[msg.sender];
    }

    // ================= EMERGENCY ACCESS =================

    function grantEmergencyAccess(
        address patient,
        address doctor,
        uint durationSeconds
    ) public onlyReceptionist {

        require(roles[doctor] == Role.DOCTOR, "Not doctor");
        require(roles[patient] == Role.PATIENT, "Not patient");

        emergencyAccess[patient][doctor] =
            block.timestamp + durationSeconds;

        emit EmergencyGranted(
            patient,
            doctor,
            emergencyAccess[patient][doctor]
        );
    }

    function hasEmergencyAccess(address patient, address doctor)
        public
        view
        returns(bool)
    {
        return emergencyAccess[patient][doctor] > block.timestamp;
    }

    // ================= DOCTOR ACTIONS =================

    function addRecord(
        address _patient,
        string memory _diagnosis,
        string memory _prescription,
        string memory _ipfsHash
    ) public onlyDoctor {

        require(roles[_patient] == Role.PATIENT, "Not patient");

        require(
            permission[_patient][msg.sender] ||
            hasEmergencyAccess(_patient,msg.sender),
            "No permission"
        );

        records[_patient].push(
            Record(
                _diagnosis,
                _prescription,
                _ipfsHash,
                block.timestamp,
                msg.sender
            )
        );

        emit RecordAdded(_patient, msg.sender);
    }

    function getPatientRecords(address _patient)
        public
        view
        onlyDoctor
        returns (Record[] memory)
    {
        require(
            permission[_patient][msg.sender] ||
            hasEmergencyAccess(_patient,msg.sender),
            "No permission"
        );

        return records[_patient];
    }

    // ================= HELPERS =================

    function myRole() public view returns (Role) {
        return roles[msg.sender];
    }
}
