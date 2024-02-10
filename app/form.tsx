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
  let formRef = useRef<HTMLFormElement>(null);

  let matchStub = {
    id: uuidv4(),
    created_at: new Date().getTime(),
    title: "",
    users: ["", ""],
    winner: "",
    referee: "",
  } as Match;

  let [state, mutate] = useOptimistic(
    { pending: false, newMatch: matchStub },
    function createReducer(state, match: MatchState) {
      return {
        ...match,
      };
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let [isPending, startTransition] = useTransition();

  return (
    <>
      <div className="mx-8 w-full">
        <form
          className="relative mt-8 mb-6"
          ref={formRef}
          onSubmit={(event) => {
            event.preventDefault();
            let formData = new FormData(event.currentTarget);
            let newMatch = {
              ...state.newMatch,
              title: formData.get("title") as string,
              referee: formData.get("referee") as string,
            };

            formRef.current?.reset();
            startTransition(async () => {
              mutate({
                newMatch,
                pending: true,
              });

              await saveMatch(newMatch);
            });
          }}
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
              key={index} // Use index as key
              value={user} // Set input value from newMatch.users state
              onChange={(event) => updateUser(index, event.target.value)} // Update user when input changes
              aria-label={`User ${index + 1}`}
              className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
              maxLength={150}
              placeholder={`User ${index + 1}`}
              required
              type="text"
              name="users"
            />
          ))}
          <div className={"pt-4 flex justify-end"}>
            <button
              className={clsx(
                "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md w-24 focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                state.pending && "bg-gray-700 cursor-not-allowed"
              )}
              type="submit"
              disabled={state.pending}
            >
              Create
            </button>
          </div>
        </form>
      </div>
      <div className="w-full"></div>
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
