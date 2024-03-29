"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import { saveMatch } from "./actions";
import { v4 as uuidv4 } from "uuid";
import FarcasterUserSelector from "./FarcasterUserSelector";
import TagsSelector from "./TagsSelector";
import { MATCH_EXPIRY, Match, UserProfile } from "./types";
import Link from "next/link";
import { Tag } from "./types";

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
    users: [null, null],
    tags: [],
    winners: [],
    referee: "",
    attestationUID: null,
  };

  const [state, setState] = useState<MatchState>({
    newMatch: initialMatch,
    pending: false,
    maxUsersCount: 16,
  });

  const handleTagsChange = (tags: Tag[]) => {
    setState((prevState) => ({
      ...prevState,
      newMatch: {
        ...prevState.newMatch,
        tags: tags,
      },
    }));
  };

  const handleUserChange = (index: number, newUser: UserProfile) => {
    const users = [...state.newMatch.users];
    users[index] = newUser;
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
        users: [...prevState.newMatch.users, null as any],
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

          <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
            <div
              style={{
                marginRight: "0.375rem",
              }}
            >
              💠
            </div>
            <div>Tags</div>
          </div>
          <div className="flex flex-row mt-1">
            <div className="grow">
              <TagsSelector
                value={state.newMatch.tags}
                onSelect={(event) => handleTagsChange(event)}
              />
            </div>
          </div>

          <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
            <img
              src="/emojis/woman-judge.png"
              style={{
                marginRight: "0.375rem",
                width: "1.25rem",
                height: "1.25rem",
              }}
            />
            <div>Referee</div>
          </div>
          <input
            aria-label="Match Referee"
            className="px-3 py-2 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            maxLength={48}
            placeholder="User who will decide the winner..."
            required
            type="text"
            name="referee"
          />

          <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
            <img
              src="/emojis/ninja.png"
              style={{
                marginRight: "0.375rem",
                width: "1.25rem",
                height: "1.25rem",
              }}
            />
            <div>Participants</div>
          </div>
          {state.newMatch.users.map((user, index) => (
            <div className="flex flex-row flex-nowrap mt-1" key={index}>
              <div className="grow">
                <FarcasterUserSelector
                  value={user}
                  onSelect={(event) => handleUserChange(index, event as any)}
                />
              </div>
              {state.newMatch.users.length > 2 && (
                <button
                  className={`ml-1 flex items-center justify-center text-lg border bg-blue-500 text-white rounded-md focus:outline-none hover:bg-blue-700 ${
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
        <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
          <img
            src="/emojis/woman-judge.png"
            style={{
              marginRight: "0.375rem",
              width: "1.25rem",
              height: "1.25rem",
            }}
          />
          <div>Referee</div>
        </div>
        <div className="text-left flex text-md">{match.referee}</div>
        <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
          <img
            src="/emojis/ninja.png"
            style={{
              marginRight: "0.375rem",
              width: "1.25rem",
              height: "1.25rem",
            }}
          />
          <div>Participants</div>
        </div>
        <div className="text-left flex flex-col text-md">
          {match.users.map((user, index) => (
            <FarcasterUserSelector key={index} value={user} />
          ))}
        </div>
        <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
          <img
            src="/emojis/trophy.png"
            style={{
              marginRight: "0.375rem",
              width: "1.25rem",
              height: "1.25rem",
            }}
          />
          <div>Winners</div>
        </div>
        <div className="text-left flex text-md">
          {match.winners.length > 0
            ? match.winners.join(", ")
            : "No winners yet..."}
        </div>
        <div className="flex flex-row items-center text-left text-xl font-bold mt-4">
          <img
            src="/emojis/stopwatch.png"
            style={{
              marginRight: "0.375rem",
              width: "1.25rem",
              height: "1.25rem",
            }}
          />
          <div>Expires</div>
        </div>
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
