function createMatrix() {

    const size = Number(document.getElementById("matrixSize").value);
    const container = document.getElementById("matrixContainer");
    const resultContainer = document.getElementById("resultContainer");

    container.innerHTML = "";
    resultContainer.innerHTML = "";

    if (!Number.isInteger(size) || size < 2 || size > 10) {
        displayError("Matrix size must be an integer between 2 and 10.");
        return;
    }

    // Section heading - Step 02
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "section-title";

    const stepNumber = document.createElement("div");
    stepNumber.className = "step-number";
    stepNumber.textContent = "02";

    const titleContent = document.createElement("div");

    const heading = document.createElement("h2");
    heading.textContent = "Enter Matrix Values";

    const description = document.createElement("p");
    description.textContent =
        "Enter the coefficients and constants of your equations.";

    titleContent.appendChild(heading);
    titleContent.appendChild(description);

    sectionTitle.appendChild(stepNumber);
    sectionTitle.appendChild(titleContent);

    container.appendChild(sectionTitle);

    // Matrix table
    const table = document.createElement("table");

    for (let i = 0; i < size; i++) {

        const row = document.createElement("tr");

        for (let j = 0; j < size; j++) {

            const cell = document.createElement("td");
            const input = document.createElement("input");

            input.type = "number";
            input.value = "0";
            input.className = "matrix-input";

            cell.appendChild(input);
            row.appendChild(cell);
        }

        const rhsCell = document.createElement("td");
        const rhsInput = document.createElement("input");

        rhsInput.type = "number";
        rhsInput.value = "0";
        rhsInput.className = "rhs-input";

        rhsCell.appendChild(rhsInput);
        row.appendChild(rhsCell);

        table.appendChild(row);
    }

    container.appendChild(table);

    createInitialGuess(size);
}


function createInitialGuess(size) {

    const container = document.getElementById("initialGuessContainer");

    container.innerHTML = "";

    // Section heading - Step 04
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "section-title";

    const stepNumber = document.createElement("div");
    stepNumber.className = "step-number";
    stepNumber.textContent = "04";

    const titleContent = document.createElement("div");

    const heading = document.createElement("h2");
    heading.textContent = "Initial Guess";

    const description = document.createElement("p");
    description.textContent =
        "Provide the starting values for the iteration.";

    titleContent.appendChild(heading);
    titleContent.appendChild(description);

    sectionTitle.appendChild(stepNumber);
    sectionTitle.appendChild(titleContent);

    container.appendChild(sectionTitle);

    // Initial guess inputs
    for (let i = 0; i < size; i++) {

        const label = document.createElement("label");
        label.textContent = "x" + (i + 1) + ":";

        const input = document.createElement("input");

        input.type = "number";
        input.value = "0";
        input.className = "guess-input";

        container.appendChild(label);
        container.appendChild(input);
    }
}


function solveGaussSeidel() {

    const size = Number(document.getElementById("matrixSize").value);
    const tolerance = Number(document.getElementById("tolerance").value);
    const maxIterations = Number(document.getElementById("maxIterations").value);

    const matrixInputs = document.querySelectorAll(".matrix-input");
    const rhsInputs = document.querySelectorAll(".rhs-input");
    const guessInputs = document.querySelectorAll(".guess-input");

    if (!Number.isInteger(size) || size < 2 || size > 10) {
        displayError("Matrix size must be an integer between 2 and 10.");
        return;
    }

    if (!Number.isFinite(tolerance) || tolerance <= 0) {
        displayError("Tolerance must be greater than zero.");
        return;
    }

    if (!Number.isInteger(maxIterations) || maxIterations <= 0) {
        displayError("Maximum iterations must be a positive integer.");
        return;
    }

    if (matrixInputs.length !== size * size) {
        displayError("Please generate the matrix first.");
        return;
    }

    const A = [];
    const B = [];
    const X = [];

    // Read matrix values
    for (let i = 0; i < size; i++) {

        A[i] = [];

        for (let j = 0; j < size; j++) {

            const value = Number(
                matrixInputs[i * size + j].value
            );

            if (!Number.isFinite(value)) {
                displayError(
                    "Please enter valid numbers in the matrix."
                );
                return;
            }

            A[i][j] = value;
        }

        const rhs = Number(rhsInputs[i].value);

        if (!Number.isFinite(rhs)) {
            displayError("Please enter valid RHS values.");
            return;
        }

        B[i] = rhs;

        const guess = Number(guessInputs[i].value);

        if (!Number.isFinite(guess)) {
            displayError(
                "Please enter valid initial guess values."
            );
            return;
        }

        X[i] = guess;
    }


    // Check diagonal elements
    for (let i = 0; i < size; i++) {

        if (A[i][i] === 0) {

            displayError(
                "Cannot solve: diagonal element a" +
                (i + 1) +
                (i + 1) +
                " is zero."
            );

            return;
        }
    }


    // Check diagonal dominance
    let diagonallyDominant = true;

    for (let i = 0; i < size; i++) {

        const diagonal = Math.abs(A[i][i]);
        let offDiagonal = 0;

        for (let j = 0; j < size; j++) {

            if (j !== i) {
                offDiagonal += Math.abs(A[i][j]);
            }
        }

        if (diagonal <= offDiagonal) {
            diagonallyDominant = false;
            break;
        }
    }


    let converged = false;
    let iteration = 0;
    let finalError = 0;

    const history = [];
    const steps = [];


    // Gauss-Seidel iterations
    while (iteration < maxIterations) {

        const oldX = [...X];
        const iterationSteps = [];

        for (let i = 0; i < size; i++) {

            const oldValue = X[i];

            let sum = B[i];

            const terms = [];

            for (let j = 0; j < size; j++) {

                if (j !== i) {

                    terms.push({
                        coefficient: A[i][j],
                        variable: "x" + (j + 1),
                        value: X[j]
                    });

                    sum = sum - A[i][j] * X[j];
                }
            }

            const newValue = sum / A[i][i];

            X[i] = newValue;

            iterationSteps.push({
                variable: "x" + (i + 1),
                oldValue: oldValue,
                newValue: newValue,
                diagonal: A[i][i],
                rhs: B[i],
                terms: terms
            });
        }


        // Check invalid values
        for (let i = 0; i < size; i++) {

            if (!Number.isFinite(X[i])) {

                displayError(
                    "The calculation produced an invalid result. " +
                    "The method may be diverging."
                );

                return;
            }
        }


        // Calculate error
        let error = 0;

        for (let i = 0; i < size; i++) {

            error = Math.max(
                error,
                Math.abs(X[i] - oldX[i])
            );
        }

        finalError = error;

        iteration++;


        history.push({
            iteration: iteration,
            values: [...X],
            error: error
        });


        steps.push({
            iteration: iteration,
            calculations: iterationSteps
        });


        if (error < tolerance) {

            converged = true;
            break;
        }
    }


    displayResult(
        X,
        iteration,
        converged,
        finalError,
        history,
        diagonallyDominant,
        steps
    );
}


function displayResult(
    X,
    iteration,
    converged,
    error,
    history,
    diagonallyDominant,
    steps
) {

    const container =
        document.getElementById("resultContainer");

    container.innerHTML = "";


    // Warning
    if (!diagonallyDominant) {

        const warning = document.createElement("div");

        warning.className = "warning-box";

        warning.textContent =
            "Warning: The matrix is not strictly diagonally dominant. " +
            "Gauss-Seidel convergence is not guaranteed.";

        container.appendChild(warning);
    }


    // Result heading
    const heading = document.createElement("h2");

    heading.textContent = "Result";

    container.appendChild(heading);


    // Solution
    const solutionBox = document.createElement("div");

    solutionBox.className = "solution-box";

    for (let i = 0; i < X.length; i++) {

        const valueBox = document.createElement("div");

        valueBox.className = "solution-value";

        const variable = document.createElement("span");

        variable.textContent = "x" + (i + 1);

        const value = document.createElement("strong");

        value.textContent = X[i].toFixed(6);

        valueBox.appendChild(variable);
        valueBox.appendChild(value);

        solutionBox.appendChild(valueBox);
    }

    container.appendChild(solutionBox);


    // Summary
    const summary = document.createElement("div");

    summary.className = "summary-grid";


    const iterationBox = document.createElement("div");

    iterationBox.className = "summary-item";

    iterationBox.innerHTML =
        "<span>Iterations</span>" +
        "<strong>" +
        iteration +
        "</strong>";

    summary.appendChild(iterationBox);


    const errorBox = document.createElement("div");

    errorBox.className = "summary-item";

    errorBox.innerHTML =
        "<span>Final Error</span>" +
        "<strong>" +
        error.toFixed(10) +
        "</strong>";

    summary.appendChild(errorBox);

    container.appendChild(summary);


    // Status
    const status = document.createElement("div");

    status.className = "status-box";

    if (converged) {

        status.classList.add("success");

        status.textContent =
            "Status: Converged successfully.";

    } else {

        status.classList.add("warning");

        status.textContent =
            "Status: Maximum iterations reached without convergence.";
    }

    container.appendChild(status);


    // Iteration history
    const historyHeading = document.createElement("h2");

    historyHeading.className = "history-title";

    historyHeading.textContent = "Iteration History";

    container.appendChild(historyHeading);


    const table = document.createElement("table");

    table.className = "history-table";

    const headerRow = document.createElement("tr");

    const iterationHeader = document.createElement("th");

    iterationHeader.textContent = "Iteration";

    headerRow.appendChild(iterationHeader);


    for (let i = 0; i < X.length; i++) {

        const header = document.createElement("th");

        header.textContent = "x" + (i + 1);

        headerRow.appendChild(header);
    }


    const errorHeader = document.createElement("th");

    errorHeader.textContent = "Error";

    headerRow.appendChild(errorHeader);

    table.appendChild(headerRow);


    for (const record of history) {

        const row = document.createElement("tr");

        const iterationCell = document.createElement("td");

        iterationCell.textContent = record.iteration;

        row.appendChild(iterationCell);


        for (const value of record.values) {

            const cell = document.createElement("td");

            cell.textContent = value.toFixed(6);

            row.appendChild(cell);
        }


        const errorCell = document.createElement("td");

        errorCell.textContent =
            record.error.toFixed(10);

        row.appendChild(errorCell);

        table.appendChild(row);
    }

    container.appendChild(table);


    // Step-by-step calculation
    const stepHeading = document.createElement("h2");

    stepHeading.className = "history-title";

    stepHeading.textContent =
        "Step-by-Step Calculation";

    container.appendChild(stepHeading);


    const description = document.createElement("p");

    description.textContent =
        "The following steps show how each variable is updated during every Gauss-Seidel iteration.";

    description.style.color = "#74798f";
    description.style.fontSize = "13px";
    description.style.lineHeight = "1.6";

    container.appendChild(description);


    for (const iterationData of steps) {

        const iterationBox =
            document.createElement("div");

        iterationBox.style.marginTop = "18px";
        iterationBox.style.padding = "18px";
        iterationBox.style.border =
            "1px solid #e4e1f7";
        iterationBox.style.borderRadius = "13px";
        iterationBox.style.background = "#f8f7ff";


        const iterationTitle =
            document.createElement("h3");

        iterationTitle.textContent =
            "Iteration " +
            iterationData.iteration;

        iterationTitle.style.margin =
            "0 0 14px";

        iterationTitle.style.color =
            "#3730a3";

        iterationBox.appendChild(iterationTitle);


        for (
            const calculationData
            of iterationData.calculations
        ) {

            const calculation =
                document.createElement("div");

            calculation.style.marginBottom = "14px";
            calculation.style.padding = "14px";
            calculation.style.background = "#ffffff";
            calculation.style.border =
                "1px solid #e6e7f0";
            calculation.style.borderRadius = "10px";


            const title =
                document.createElement("strong");

            title.textContent =
                calculationData.variable +
                " calculation";

            title.style.display = "block";
            title.style.marginBottom = "8px";

            calculation.appendChild(title);


            const formula =
                document.createElement("div");

            formula.style.fontFamily =
                "monospace";

            formula.style.fontSize =
                "13px";

            formula.style.lineHeight =
                "1.8";

            formula.style.color =
                "#4f46c5";


            let expression =
                calculationData.variable +
                " = (" +
                formatNumber(calculationData.rhs);


            for (
                const term
                of calculationData.terms
            ) {

                if (term.coefficient >= 0) {

                    expression =
                        expression +
                        " - " +
                        formatNumber(term.coefficient) +
                        " * " +
                        term.variable +
                        "(" +
                        formatNumber(term.value) +
                        ")";

                } else {

                    expression =
                        expression +
                        " + " +
                        formatNumber(
                            Math.abs(term.coefficient)
                        ) +
                        " * " +
                        term.variable +
                        "(" +
                        formatNumber(term.value) +
                        ")";
                }
            }


            expression =
                expression +
                ") / " +
                formatNumber(
                    calculationData.diagonal
                );


            formula.textContent =
                expression;

            calculation.appendChild(formula);


            const result =
                document.createElement("div");

            result.style.marginTop = "8px";
            result.style.fontWeight = "700";
            result.style.color = "#157348";

            result.textContent =
                calculationData.variable +
                " = " +
                calculationData.newValue.toFixed(6);

            calculation.appendChild(result);

            iterationBox.appendChild(calculation);
        }

        container.appendChild(iterationBox);
    }
}


function formatNumber(value) {

    return Number(value).toFixed(4);
}


function displayError(message) {

    const container =
        document.getElementById("resultContainer");

    container.innerHTML = "";

    const error =
        document.createElement("div");

    error.className = "error-box";

    error.textContent =
        "Error: " + message;

    container.appendChild(error);
}


function resetAll() {

    document.getElementById(
        "matrixContainer"
    ).innerHTML = "";

    document.getElementById(
        "initialGuessContainer"
    ).innerHTML = "";

    document.getElementById(
        "resultContainer"
    ).innerHTML = "";

    document.getElementById(
        "matrixSize"
    ).value = 3;

    document.getElementById(
        "tolerance"
    ).value = 0.0001;

    document.getElementById(
        "maxIterations"
    ).value = 100;
}


console.log(
    "Gauss-Seidel Method is ready."
);
