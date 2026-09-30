// API URL
const API_URL = "http://localhost:3000/api/students";

// HTML elements
const addStudentButton = document.getElementById("addStudentBtn");
const studentForm = document.getElementById("studentForm");
const cancelButton = document.getElementById("cancelBtn");
const addStudentForm = document.getElementById("addStudentForm");

const studentTableBody = document.getElementById("studentTableBody");
const studentCount = document.getElementById("studentCount");
const courseCount = document.getElementById("courseCount");
const teacherCount = document.getElementById("teacherCount");
const searchInput = document.getElementById("searchInput");

// Store students loaded from database
let students = [];

// Student currently being edited
let editingId = null;


// ========================================
// SHOW FORM
// ========================================

addStudentButton.addEventListener("click", function () {
    studentForm.style.display = "block";
    editingId = null;
    addStudentForm.reset();
});


// ========================================
// HIDE FORM
// ========================================

cancelButton.addEventListener("click", function () {
    studentForm.style.display = "none";
    editingId = null;
    addStudentForm.reset();
});


// ========================================
// LOAD STUDENTS FROM MYSQL
// ========================================

async function loadStudents() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load students");
        }

        students = await response.json();

        displayStudents(students);
        const teacherResponse = await fetch("http://localhost:3000/api/teachers");

        if (!teacherResponse.ok) {
             throw new Error("Failed to load teachers");
        }

        const teachers = await teacherResponse.json();

        teacherCount.textContent = teachers.length;

    } catch (error) {
        console.error("Error loading students:", error);
        alert("Unable to load students from the database.");
    }
}


// ========================================
// DISPLAY STUDENTS
// ========================================

function displayStudents(studentArray) {

    studentTableBody.innerHTML = "";

    studentCount.textContent = students.length;
    const uniqueCourses = [
    ...new Set(
        students
            .map(function (student) {
                return student.course;
            })
            .filter(function (course) {
                return course;
            })
    )
];

courseCount.textContent = uniqueCourses.length;

    if (studentArray.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center;">
                    No students found
                </td>
            </tr>
        `;

        return;
    }

    studentArray.forEach(function (student) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.phone || ""}</td>
            <td>${student.department || ""}</td>
            <td>${student.course || ""}</td>
            <td>
                <button
                    class="edit-btn"
                    onclick="editStudentById('${student.id}')">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteStudentById('${student.id}')">
                    Delete
                </button>
            </td>
        `;

        studentTableBody.appendChild(row);
    });
}


// ========================================
// ADD / UPDATE STUDENT
// ========================================

addStudentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const student = {
        id: document.getElementById("studentId").value.trim(),
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        dob: document.getElementById("studentDob").value,
        gender: document.getElementById("studentGender").value,
        department: document.getElementById("studentDepartment").value,
        course: document.getElementById("studentCourse").value
    };


    try {

        // UPDATE existing student
        if (editingId !== null) {

            const response = await fetch(
                `${API_URL}/${editingId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update student");
            }

            alert("Student updated successfully!");

        }

        // ADD new student
        else {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to add student");
            }

            alert("Student added successfully!");
        }


        // Reload data from MySQL
        await loadStudents();

        // Reset form
        addStudentForm.reset();

        studentForm.style.display = "none";

        editingId = null;


    } catch (error) {

        console.error("Error saving student:", error);

        alert("Unable to save student.");
    }

});


// ========================================
// EDIT STUDENT
// ========================================

function editStudentById(id) {

    const student = students.find(function (student) {
        return student.id === id;
    });

    if (!student) {
        alert("Student not found.");
        return;
    }

    editingId = id;

    studentForm.style.display = "block";

    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentEmail").value = student.email;
    document.getElementById("studentPhone").value = student.phone || "";
    document.getElementById("studentDob").value = student.dob || "";
    document.getElementById("studentGender").value = student.gender || "";
    document.getElementById("studentDepartment").value = student.department || "";
    document.getElementById("studentCourse").value = student.course || "";
}


// ========================================
// DELETE STUDENT
// ========================================

async function deleteStudentById(id) {

    const student = students.find(function (student) {
        return student.id === id;
    });

    if (!student) {
        return;
    }

    const confirmDelete = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete student");
        }

        alert("Student deleted successfully!");

        await loadStudents();


    } catch (error) {

        console.error("Error deleting student:", error);

        alert("Unable to delete student.");
    }
}


// ========================================
// SEARCH STUDENTS
// ========================================

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase().trim();

    const filteredStudents = students.filter(function (student) {

        return (
            student.id.toLowerCase().includes(searchText) ||
            student.name.toLowerCase().includes(searchText) ||
            student.email.toLowerCase().includes(searchText) ||
            (student.department || "").toLowerCase().includes(searchText)
        );

    });

    displayStudents(filteredStudents);
});


// ========================================
// LOAD STUDENTS WHEN PAGE OPENS
// ========================================

loadStudents();
// =============================
// TEACHER MANAGEMENT
// =============================

let editingTeacherId = null;

const addTeacherButton = document.getElementById("addTeacherBtn");
const teacherForm = document.getElementById("teacherForm");
const cancelTeacherButton = document.getElementById("cancelTeacherBtn");
const addTeacherForm = document.getElementById("addTeacherForm");
const teacherTableBody = document.getElementById("teacherTableBody");

// Show teacher form
addTeacherButton.addEventListener("click", function () {
    teacherForm.style.display = "block";
});

// Hide teacher form
cancelTeacherButton.addEventListener("click", function () {
    teacherForm.style.display = "none";
    addTeacherForm.reset();
});

// Load teachers from database
async function loadTeachers() {
    try {
        const response = await fetch("http://localhost:3000/api/teachers");

        if (!response.ok) {
            throw new Error("Failed to load teachers");
        }

        const teachers = await response.json();

        displayTeachers(teachers);

        // Update teacher count
        teacherCount.textContent = teachers.length;

    } catch (error) {
        console.error("Error loading teachers:", error);
    }
}

// Display teachers
function displayTeachers(teachers) {

    teacherTableBody.innerHTML = "";

    if (teachers.length === 0) {
        teacherTableBody.innerHTML = `
            <tr>
                <td colspan="6">No teachers found</td>
            </tr>
        `;
        return;
    }

    teachers.forEach(function (teacher) {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.email}</td>
            <td>${teacher.phone || ""}</td>
            <td>${teacher.department || ""}</td>
            <td>
                <button class="edit-btn"
                  onclick="editTeacher('${teacher.id}')">
                  Edit
                </button>

                <button class="delete-btn"
                  onclick="deleteTeacher('${teacher.id}')">
                  Delete
                </button>
            </td>
        ;

        teacherTableBody.appendChild(row);
    });
}

// Add teacher
addTeacherForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const teacher = {
        id: document.getElementById("teacherId").value,
        name: document.getElementById("teacherName").value,
        email: document.getElementById("teacherEmail").value,
        phone: document.getElementById("teacherPhone").value,
        department: document.getElementById("teacherDepartment").value
    };

    try {

        const response = await fetch("http://localhost:3000/api/teachers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(teacher)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to add teacher");
            return;
        }

        alert("Teacher added successfully!");

        addTeacherForm.reset();
        teacherForm.style.display = "none";

        loadTeachers();

    } catch (error) {

        console.error(error);

        alert("Could not connect to the backend.");
    }
});

// Delete teacher
async function deleteTeacher(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this teacher?"
    );

    if (!confirmDelete) {
        return;
    }

   try {
      const response = await fetch(
         "http://localhost:3000/api/teachers/" + id,
         {
             method: "DELETE"
         }
      );

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Failed to delete teacher");
            return;
        }

        loadTeachers();

    } catch (error) {

        console.error(error);

        alert("Could not connect to the backend.");
    }
}
// Edit teacher
async function editTeacher(id) {
    try {
        const response = await fetch(
            "http://localhost:3000/api/teachers/" + id,
        );

        if (!response.ok) {
            throw new Error("Failed to get teacher");
        }

        const teacher = await response.json();

        editingTeacherId = id;

        document.getElementById("teacherId").value = teacher.id;
        document.getElementById("teacherName").value = teacher.name;
        document.getElementById("teacherEmail").value = teacher.email;
        document.getElementById("teacherPhone").value = teacher.phone || "";
        document.getElementById("teacherDepartment").value =
            teacher.department || "";

        teacherForm.style.display = "block";

    } catch (error) {
        console.error(error);
        alert("Could not load teacher details.");
    }
}
// Load teachers when page opens
loadTeachers();