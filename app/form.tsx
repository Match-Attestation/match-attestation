"use client";

import clsx from "clsx";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { saveMatch } from "./actions";
import { v4 as uuidv4 } from "uuid";
import { MATCH_EXPIRY, Match } from "./types";
import Link from "next/link";

type MatchState = {
  newMatch: Match;
  pending: boolean;
  maxUsersCount: number;
};

export function MatchCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const initialMatch: Match = {
    id: uuidv4(),
    created_at: new Date().getTime(),
    title: "",
    users: ["", ""],
    winners: [],
    referee: "",
    attestationUID: null,
  };

  const [state, setState] = useState<MatchState>({
    newMatch: initialMatch,
    pending: false,
    maxUsersCount: 16,
  });

  const handleUserChange = (index: number, value: string) => {
    const users = [...state.newMatch.users];
    users[index] = value;
    setState((prevState) => ({
      ...prevState,
      newMatch: {
        ...prevState.newMatch,
        users,
      },
    }));
  };

  const handleAddUser = () => {
    setState((prevState) => ({
      ...prevState,
      newMatch: {
        ...prevState.newMatch,
        users: [...prevState.newMatch.users, ""],
      },
    }));
  };

  const handleDeleteUser = (index: number) => {
    const users = [...state.newMatch.users];
    users.splice(index, 1);
    setState((prevState) => ({
      ...prevState,
      newMatch: {
        ...prevState.newMatch,
        users,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(formRef.current as HTMLFormElement);
    const newMatch: Match = {
      ...state.newMatch,
      title: formData.get("title") as string,
      referee: formData.get("referee") as string,
    };
    setState({
      newMatch,
      pending: true,
      maxUsersCount: state.maxUsersCount,
    });

    await saveMatch(newMatch);
  };

  return (
    <>
      <div className="mx-4 sm:mx-8 w-full">
        <form
          className="relative mt-6 sm:mt-8 mb-6"
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <div className="text-left text-xl font-bold">Title</div>
          <input
            aria-label="Match Title"
            className="px-3 py-2 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            maxLength={120}
            placeholder="Describe your match..."
            required
            type="text"
            name="title"
          />

          <div className="text-left text-xl font-bold mt-4">👩‍⚖️ Referee</div>
          <input
            aria-label="Match Referee"
            className="px-3 py-2 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            maxLength={48}
            placeholder="User who will decide the winner..."
            required
            type="text"
            name="referee"
          />
          <div className="text-left text-xl font-bold mt-4">
            🥷 Participants
          </div>
          {state.newMatch.users.map((user, index) => (
            <div
              className={`flex items-center space-x-2 ${
                index == 0 ? "mt-1" : "mt-2"
              }`}
            >
              <input
                key={index}
                value={user}
                onChange={(e) => handleUserChange(index, e.target.value)}
                required
                className="flex px-3 py-2 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                placeholder={`Participant №${index + 1}`}
                aria-label={`Participant №${index + 1}`}
                type="text"
                maxLength={48}
              />
              {state.newMatch.users.length > 2 && (
                <button
                  className={`flex items-center justify-center text-lg border bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-700 ${
                    state.pending
                      ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                      : ""
                  }`}
                  style={{ minWidth: "2.875rem", height: "2.875rem" }}
                  type="button"
                  onClick={() => handleDeleteUser(index)}
                >
                  <svg
                    width={"1.875rem"}
                    fill="white"
                    viewBox="-2 -2 24 24"
                    style={{ rotate: "45deg" }}
                    preserveAspectRatio="xMinYMin"
                  >
                    <path d="M11 11h4a1 1 0 0 0 0-2h-4V5a1 1 0 0 0-2 0v4H5a1 1 0 1 0 0 2h4v4a1 1 0 0 0 2 0v-4zm-1 9C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          <div className="flex flex-col sm:flex-row sm:space-x-2 mt-4">
            <button
              className={`w-full sm:w-1/2 flex items-center p-1 justify-center px-4 text-lg border bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-700 ${
                state.pending ||
                state.newMatch.users.length >= state.maxUsersCount
                  ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                  : ""
              }`}
              style={{ height: "2.875rem" }}
              type="button"
              onClick={handleAddUser}
              disabled={
                state.pending ||
                state.newMatch.users.length >= state.maxUsersCount
              }
            >
              <svg
                width={"1.875rem"}
                fill="white"
                className="mr-2"
                viewBox="-2 -2 24 24"
                preserveAspectRatio="xMinYMin"
              >
                <path d="M11 11h4a1 1 0 0 0 0-2h-4V5a1 1 0 0 0-2 0v4H5a1 1 0 1 0 0 2h4v4a1 1 0 0 0 2 0v-4zm-1 9C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Add
            </button>
            <button
              className={`w-full sm:w-1/2 mt-2 sm:mt-0 flex items-center p-1 justify-center px-4 text-lg border bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-700 ${
                state.pending
                  ? "bg-gray-500 hover:bg-gray-600 cursor-not-allowed"
                  : ""
              }`}
              style={{ height: "2.875rem" }}
              type="submit"
              disabled={state.pending}
            >
              Create match
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function DecideMatchWinnerForm({ match }: { match: Match }) {
  return (
    <div className="mx-4 sm:mx-8 w-full">
      <div className="relative mt-6 sm:mt-8 mb-6">
        <div className="text-left text-xl font-bold">Title</div>
        <div className="text-left flex text-xl">{match.title}</div>
        <div className="text-left text-xl font-bold mt-4">👩‍⚖️ Referee</div>
        <div className="text-left flex text-md">{match.referee}</div>
        <div className="text-left text-xl font-bold mt-4">🥷 Participants</div>
        <div className="text-left flex flex-col text-md">
          {match.users.map((user, index) => (
            <div key={index}>{index + 1 + ". " + user}</div>
          ))}
        </div>
        <div className="text-left text-xl font-bold mt-4">🏆 Winners</div>
        <div className="text-left flex text-md">
          {match.winners.length > 0
            ? match.winners.join(", ")
            : "No winners yet..."}
        </div>
        <div className="text-left text-xl font-bold mt-4">⏱️ Expires</div>
        <div className="text-left flex text-md">
          {new Date(Number(match.created_at) + MATCH_EXPIRY)
            .toUTCString()
            .slice(5, 22) + " UTC"}
        </div>
        <img className="mt-4 w-full" src={`/api/image?id=${match.id}`} />
        <div className="actions mt-4">
          <Link href="/">
            <button
              className={`w-full mt-2 sm:mt-0 flex items-center p-1 justify-center px-4 text-lg border bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-700`}
              style={{ height: "2.875rem" }}
            >
              Create another match
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
