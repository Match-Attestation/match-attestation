"use client";

import clsx from "clsx";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { redirectToMatches, saveMatch, attestMatch } from "./actions";
import { v4 as uuidv4 } from "uuid";
import { Match } from "./types";
import { useRouter, useSearchParams } from "next/navigation";

type MatchState = {
  newMatch: Match;
  pending: boolean;
  voted?: boolean;
};

export function MatchCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const initialMatch: Match = {
    id: uuidv4(),
    created_at: new Date().getTime(),
    title: "",
    users: ["", ""],
    winner: "",
    referee: "",
  };

  const [state, setState] = useState<MatchState>({
    newMatch: initialMatch,
    pending: false,
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
    });

    await saveMatch(newMatch);
  };

  return (
    <>
      <div className="mx-8 w-full">
        <form
          className="relative mt-8 mb-6"
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <div className="text-left text-xl font-bold">Title</div>
          <input
            aria-label="Match Title"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            maxLength={150}
            placeholder="Describe your match..."
            required
            type="text"
            name="title"
          />

          <div className="text-left text-xl font-bold mt-4">Referee</div>
          <input
            aria-label="Match Referee"
            className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
            maxLength={150}
            placeholder="User who will decide the winner..."
            required
            type="text"
            name="referee"
          />
          <div className="text-left text-xl font-bold mt-4">Users</div>
          {state.newMatch.users.map((user, index) => (
            <input
              key={index}
              value={user}
              onChange={(e) => handleUserChange(index, e.target.value)}
              required
              className="mt-2 pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder={`User ${index + 1}`}
              aria-label={`User ${index + 1}`}
              type="text"
              maxLength={150}
            />
          ))}
          <div className="flex space-x-4 mt-4">
            <button
              className={`w-1/2 flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700 ${
                state.pending ? "bg-gray-700 cursor-not-allowed" : ""
              }`}
              type="button"
              onClick={handleAddUser}
              disabled={state.pending}
            >
              <svg
                width={24}
                fill="white"
                className="mr-2"
                viewBox="-2 -2 24 24"
                preserveAspectRatio="xMinYMin"
              >
                <path d="M11 11h4a1 1 0 0 0 0-2h-4V5a1 1 0 0 0-2 0v4H5a1 1 0 1 0 0 2h4v4a1 1 0 0 0 2 0v-4zm-1 9C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Add user
            </button>

            <button
              className={`w-1/2 flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700 ${
                state.pending ? "bg-gray-700 cursor-not-allowed" : ""
              }`}
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

function PollOptions({
  match,
  onChange,
}: {
  match: Match;
  onChange: (index: number) => void;
}) {
  return (
    <div className="mb-4 text-left">
      {match.users
        .filter((e) => e !== "")
        .map((user, index) => (
          <label key={index} className="block">
            {user}
          </label>
        ))}
    </div>
  );
}

function PollResults({ poll }: { poll: Match }) {
  return (
    <div className="mb-4">
      <img
        src={`/api/image?id=${poll.id}&results=true&date=${Date.now()}`}
        alt="poll results"
      />
    </div>
  );
}

export function PollVoteForm({
  poll,
  viewResults,
}: {
  poll: Match;
  viewResults?: boolean;
}) {
  const [selectedOption, setSelectedOption] = useState(-1);
  const router = useRouter();
  const searchParams = useSearchParams();
  viewResults = true; // Only allow voting via the api
  let formRef = useRef<HTMLFormElement>(null);
  let voteOnPoll = attestMatch.bind(null, poll);
  let [isPending, startTransition] = useTransition();
  let [state, mutate] = useOptimistic(
    { showResults: viewResults },
    function createReducer({ showResults }, state: MatchState) {
      if (state.voted || viewResults) {
        return {
          showResults: true,
        };
      } else {
        return {
          showResults: false,
        };
      }
    }
  );

  const handleVote = (index: number) => {
    setSelectedOption(index);
  };

  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-4 m-4">
      <div className="font-bold text-xl mb-2">{poll.title}</div>
      {/* <form
        className="relative my-8"
        ref={formRef}
        action={() => voteOnPoll(selectedOption)}
        onSubmit={(event) => {
          event.preventDefault();
          let formData = new FormData(event.currentTarget);
          let newMatch = {
            ...poll,
          };

          // @ts-ignore
          newMatch[`votes${selectedOption}`] += 1;

          formRef.current?.reset();
          startTransition(async () => {
            mutate({
              newMatch,
              pending: false,
              voted: true,
            });

            await redirectToMatches();
            // await attestMatch(newMatch, selectedOption);
          });
        }}
      >
        {state.showResults ? (
          <PollResults poll={poll} />
        ) : (
          <PollOptions poll={poll} onChange={handleVote} />
        )}
        {state.showResults ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Back
          </button>
        ) : (
          <button
            className={
              "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" +
              (selectedOption < 1 ? " cursor-not-allowed" : "")
            }
            type="submit"
            disabled={selectedOption < 1}
          >
            Vote
          </button>
        )}
      </form> */}
    </div>
  );
}
