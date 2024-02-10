import { MatchCreateForm } from "./form";

export let metadata = {
  title: "Farcaster match attestation",
  description: "Match attestation for farcaster",
};

export function MatchAttestationLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-label="Vercel Logo"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 64 64"
      {...props}
    >
      <g id="Flat">
        <g id="Color">
          <circle cx="32" cy="58" fill="#f9a215" r="1" />

          <path
            d="M47.2,30c0-1.73,1.29-3.64.78-5.19s-2.7-2.4-3.68-3.74-1.07-3.67-2.42-4.66-3.57-.35-5.18-.87-3-2.34-4.7-2.34S28.86,15,27.3,15.54s-3.83-.11-5.18.87-1.43,3.3-2.42,4.66S16.54,23.19,16,24.81s.78,3.46.78,5.19-1.29,3.64-.78,5.19,2.7,2.4,3.68,3.74,1.07,3.67,2.42,4.66,3.57.35,5.18.87,3,2.34,4.7,2.34,3.14-1.83,4.7-2.34,3.83.11,5.18-.87,1.43-3.3,2.42-4.66,3.16-2.12,3.68-3.74S47.2,31.73,47.2,30Z"
            fill="#fccd1d"
          />

          <circle cx="32" cy="30.09" fill="#f9a215" r="11.45" />

          <path
            d="M33.1,24l1.21,2.11a1.26,1.26,0,0,0,.85.6l2.43.48a1.22,1.22,0,0,1,.67,2L36.59,31a1.22,1.22,0,0,0-.33,1l.29,2.4a1.26,1.26,0,0,1-1.78,1.27l-2.24-1a1.3,1.3,0,0,0-1.06,0l-2.24,1a1.26,1.26,0,0,1-1.78-1.27l.29-2.4a1.22,1.22,0,0,0-.33-1l-1.67-1.78a1.22,1.22,0,0,1,.67-2l2.43-.48a1.26,1.26,0,0,0,.85-.6L30.9,24A1.28,1.28,0,0,1,33.1,24Z"
            fill="#fccd1d"
          />

          <path
            d="M11.5,54c-2.58,0-4.81-1.87-5.86-2.92a1,1,0,0,1,0-1.41c1.05-1.05,3.28-2.92,5.86-2.92s4.81,1.87,5.86,2.92a1,1,0,0,1,0,1.41C16.31,52.13,14.08,54,11.5,54Z"
            fill="#fccd1d"
          />

          <path
            d="M6.48,41.81a6.52,6.52,0,0,1-3.29-3.44,1,1,0,0,1,.48-1.32,6.61,6.61,0,0,1,4.73-.52A6.63,6.63,0,0,1,11.69,40a1,1,0,0,1-.48,1.32A6.62,6.62,0,0,1,6.48,41.81Z"
            fill="#fccd1d"
          />

          <path
            d="M4.88,29.93A4.61,4.61,0,0,1,3,27.41a1,1,0,0,1,.74-1.3,4.62,4.62,0,0,1,3.12.33A4.55,4.55,0,0,1,8.74,29,1,1,0,0,1,8,30.26,4.57,4.57,0,0,1,4.88,29.93Z"
            fill="#fccd1d"
          />

          <path
            d="M4.26,20.15a3.9,3.9,0,0,1-1.58-2.23,1,1,0,0,1,.73-1.26,4,4,0,0,1,2.72.25A3.94,3.94,0,0,1,7.7,19.14,1,1,0,0,1,7,20.4,3.87,3.87,0,0,1,4.26,20.15Z"
            fill="#fccd1d"
          />

          <path
            d="M52.5,54c2.58,0,4.81-1.87,5.86-2.92a1,1,0,0,0,0-1.41c-1-1.05-3.28-2.92-5.86-2.92s-4.81,1.87-5.86,2.92a1,1,0,0,0,0,1.41C47.69,52.13,49.92,54,52.5,54Z"
            fill="#fccd1d"
          />

          <path
            d="M57.52,41.81a6.52,6.52,0,0,0,3.29-3.44,1,1,0,0,0-.48-1.32,6.61,6.61,0,0,0-4.73-.52A6.63,6.63,0,0,0,52.31,40a1,1,0,0,0,.48,1.32A6.62,6.62,0,0,0,57.52,41.81Z"
            fill="#fccd1d"
          />

          <path
            d="M59.12,29.93A4.61,4.61,0,0,0,61,27.41a1,1,0,0,0-.74-1.3,4.62,4.62,0,0,0-3.12.33A4.55,4.55,0,0,0,55.26,29,1,1,0,0,0,56,30.26,4.57,4.57,0,0,0,59.12,29.93Z"
            fill="#fccd1d"
          />

          <path
            d="M59.74,20.15a3.9,3.9,0,0,0,1.58-2.23,1,1,0,0,0-.73-1.26,4,4,0,0,0-2.72.25,3.94,3.94,0,0,0-1.57,2.23A1,1,0,0,0,57,20.4,3.87,3.87,0,0,0,59.74,20.15Z"
            fill="#fccd1d"
          />

          <path
            d="M28.5,57.14C15,49.22,8.75,35.2,9,13V9.76a1,1,0,0,0-2,0V13C6.74,36,13.26,50.55,27.5,58.86A.9.9,0,0,0,28,59a1,1,0,0,0,.5-1.86Z"
            fill="#f9a215"
          />

          <path
            d="M56,8.76a1,1,0,0,0-1,1V13c.24,22.2-6,36.22-19.51,44.14A1,1,0,0,0,36,59a.9.9,0,0,0,.5-.14C50.74,50.55,57.26,36,57,13V9.76A1,1,0,0,0,56,8.76Z"
            fill="#f9a215"
          />

          <path
            d="M6.46,9.76a4.29,4.29,0,0,1,1-2.5.7.7,0,0,1,1.09,0,4.22,4.22,0,0,1,1,2.5,4.22,4.22,0,0,1-1,2.5.7.7,0,0,1-1.09,0A4.29,4.29,0,0,1,6.46,9.76Z"
            fill="#fccd1d"
          />

          <path
            d="M57.54,9.76a4.29,4.29,0,0,0-1-2.5.7.7,0,0,0-1.09,0,4.22,4.22,0,0,0-1,2.5,4.22,4.22,0,0,0,1,2.5.7.7,0,0,0,1.09,0A4.29,4.29,0,0,0,57.54,9.76Z"
            fill="#fccd1d"
          />
        </g>
      </g>
    </svg>
  );
}

export default async function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
        <div className="flex justify-center items-center bg-black rounded-full w-16 sm:w-24 h-16 sm:h-24 my-8">
          <MatchAttestationLogo className="h-16 sm:h-24 p-3 mb-1" />
        </div>
        <h1 className="text-lg sm:text-2xl font-bold mb-2">
          Farcaster Match attestation
        </h1>
        <h2 className="text-md sm:text-xl mx-4">
          Create a Match with up to 16 Participants,
          <br />
          with the results published on blockchain
        </h2>
        <div
          className="flex flex-wrap items-center justify-around my-8 w-full bg-white rounded-md shadow-xl h-full border border-gray-100"
          style={{ width: "36rem", maxWidth: "90dvw" }}
        >
          <MatchCreateForm />
        </div>
      </main>
    </div>
  );
}
