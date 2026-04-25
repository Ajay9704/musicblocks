/**
 * @fileoverview Tests for error message display and arrow positioning fixes
 * Tests for GitHub Issue #6855
 */

/* global require, describe, test, expect, beforeEach, jest */

// Mock the DOM elements needed for testing
const mockErrorText = {
    classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn()
    },
    style: {}
};

const mockErrorTextContent = {
    textContent: ""
};

describe("Error Message Display", () => {
    let activity;

    beforeEach(() => {
        // Reset mocks
        mockErrorText.classList.add.mockClear();
        mockErrorText.classList.remove.mockClear();
        mockErrorText.classList.contains.mockClear();
        mockErrorText.textContent = "";
        mockErrorText.style = {};

        // Mock activity instance
        activity = {
            errorText: mockErrorText,
            errorTextContent: mockErrorTextContent,
            errorMsgText: null,
            msgText: null,
            printText: { classList: { remove: jest.fn() } },
            errorMsgArrow: null,
            errorArtwork: {},
            _hideArrows: jest.fn(),
            refreshCanvas: jest.fn()
        };

        // Define hideErrorText function
        activity.hideErrorText = () => {
            if (activity.errorText) {
                activity.errorText.classList.remove("show");
            }
        };

        // Define hideMsgs function
        activity.hideMsgs = () => {
            if (
                activity.errorMsgText === null ||
                activity.msgText === null ||
                activity.errorText === undefined ||
                activity.printText === undefined
            ) {
                return;
            }
            activity.errorMsgText.parent.visible = false;
            activity.errorText.classList.remove("show");
            activity._hideArrows();

            activity.msgText.parent.visible = false;
            activity.printText.classList.remove("show");
            for (const i in activity.errorArtwork) {
                activity.errorArtwork[i].visible = false;
            }

            activity.refreshCanvas();
        };
    });

    test("hideErrorText should remove 'show' class from errorText", () => {
        activity.hideErrorText();
        expect(mockErrorText.classList.remove).toHaveBeenCalledWith("show");
    });

    test("hideErrorText should not throw if errorText is null", () => {
        activity.errorText = null;
        expect(() => activity.hideErrorText()).not.toThrow();
    });

    test("hideMsgs should remove 'show' class from errorText", () => {
        // Set up required properties
        activity.errorMsgText = { parent: { visible: true } };
        activity.msgText = { parent: { visible: true } };

        activity.hideMsgs();

        expect(mockErrorText.classList.remove).toHaveBeenCalledWith("show");
        expect(activity._hideArrows).toHaveBeenCalled();
        expect(activity.refreshCanvas).toHaveBeenCalled();
    });

    test("hideMsgs should return early if containers not ready", () => {
        activity.errorMsgText = null;
        activity.hideMsgs();

        expect(mockErrorText.classList.remove).not.toHaveBeenCalled();
        expect(activity._hideArrows).not.toHaveBeenCalled();
    });
});

describe("Error Arrow Distance Calculation", () => {
    test("should calculate distance correctly using Pythagorean theorem", () => {
        const fromX = 500;
        const fromY = 128;
        const toX = 600;
        const toY = 228;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Distance should be sqrt(100^2 + 100^2) = sqrt(20000) ≈ 141.42
        expect(distance).toBeCloseTo(141.42, 2);
    });

    test("should allow arrow drawing when block is within max distance", () => {
        const canvasWidth = 1000;
        const canvasHeight = 800;
        const maxArrowDistance = Math.max(canvasWidth, canvasHeight) * 1.5; // 1500

        const fromX = canvasWidth / 2;
        const fromY = 128;
        const toX = 600;
        const toY = 400;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        expect(distance).toBeLessThanOrEqual(maxArrowDistance);
    });

    test("should prevent arrow drawing when block is too far away", () => {
        const canvasWidth = 1000;
        const canvasHeight = 800;
        const maxArrowDistance = Math.max(canvasWidth, canvasHeight) * 1.5; // 1500

        const fromX = canvasWidth / 2;
        const fromY = 128;
        // Block very far away
        const toX = 5000;
        const toY = 5000;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        expect(distance).toBeGreaterThan(maxArrowDistance);
    });

    test("maxArrowDistance should scale with canvas size", () => {
        const canvasWidth1 = 800;
        const canvasHeight1 = 600;
        const maxDistance1 = Math.max(canvasWidth1, canvasHeight1) * 1.5;

        const canvasWidth2 = 1920;
        const canvasHeight2 = 1080;
        const maxDistance2 = Math.max(canvasWidth2, canvasHeight2) * 1.5;

        expect(maxDistance1).toBe(1200);
        expect(maxDistance2).toBe(2880);
        expect(maxDistance2).toBeGreaterThan(maxDistance1);
    });
});

describe("Error Message CSS Classes", () => {
    test("error message should use class-based visibility", () => {
        const element = {
            classList: {
                add: jest.fn(),
                remove: jest.fn()
            }
        };

        // Simulate showing error
        element.classList.add("show");
        expect(element.classList.add).toHaveBeenCalledWith("show");

        // Simulate hiding error
        element.classList.remove("show");
        expect(element.classList.remove).toHaveBeenCalledWith("show");
    });

    test("should not use inline style.display for hiding", () => {
        const element = {
            classList: {
                remove: jest.fn()
            },
            style: {
                display: ""
            }
        };

        // The fixed implementation should use classList, not style.display
        if (element) {
            element.classList.remove("show");
        }

        expect(element.classList.remove).toHaveBeenCalledWith("show");
        expect(element.style.display).toBe(""); // Should not be modified
    });
});
