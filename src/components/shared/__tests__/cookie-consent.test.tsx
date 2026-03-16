import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookieConsent } from "../cookie-consent";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("CookieConsent", () => {
  it("renders banner when no consent stored", () => {
    render(<CookieConsent />);
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /decline/i })).toBeInTheDocument();
  });

  it("hides after clicking Accept", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument();
  });

  it("hides after clicking Decline", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument();
  });

  it("stores 'accepted' in localStorage when accepted", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /accept/i }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("nub-cookie-consent", "accepted");
  });

  it("stores 'declined' in localStorage when declined", () => {
    render(<CookieConsent />);
    fireEvent.click(screen.getByRole("button", { name: /decline/i }));
    expect(localStorageMock.setItem).toHaveBeenCalledWith("nub-cookie-consent", "declined");
  });

  it("does not render if consent already stored", () => {
    localStorageMock.getItem.mockReturnValue("accepted");
    render(<CookieConsent />);
    expect(screen.queryByText(/cookies/i)).not.toBeInTheDocument();
  });
});
