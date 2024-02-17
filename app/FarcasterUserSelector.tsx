import React, { useState, useEffect } from "react";
import Select from "react-select";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { UserProfile } from "./types";
import useDebounce from "./helpers/use-debounde";

interface Props {
  onSelect?: (item: UserProfile) => void;
  value?: UserProfile | null;
}

const FarcasterUserSelector: React.FC<Props> = ({ value, onSelect }) => {
  const neynarApiKey = "2CBFF4D9-F0D6-4C9D-8EB9-1E1EA6F84966";
  const client = new NeynarAPIClient(neynarApiKey);

  const [searchValue, setSearchValue] = useState("");
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchValue, 300);

  useEffect(() => {
    const fetchUserProfiles = async (search: string) => {
      setIsLoading(true);
      try {
        const data = await client.searchUser(search, 3);
        setUserProfiles(data.result.users as any);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (debouncedSearchTerm) {
      fetchUserProfiles(debouncedSearchTerm);
    } else {
      setUserProfiles([]);
    }
  }, [debouncedSearchTerm]);

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      background: "white",
      borderColor: "rgb(229, 231, 235)",
      borderRadius: "0.375rem",
      lineHeight: "1.75rem",
      height: "46px",
      fontSize: "1.125rem",
      boxShadow: state.isFocused ? "0 0 0 3px rgb(147, 197, 253);" : "none",
      "&:hover": {
        borderColor: "rgb(229, 231, 235)",
      },
    }),
    option: (provided: any, { data, isFocused, isSelected }: any) => {
      return {
        ...provided,
        backgroundColor: isSelected
          ? "rgb(147, 197, 253)"
          : isFocused
          ? "rgb(229, 231, 235)"
          : "white",
        color: "black",
      };
    },
    placeholder: (provided: any) => {
      return {
        ...provided,
        textAlign: "start",
        color: "rgb(156 163 175);",
      };
    },
  };

  const handleInputChange = (newValue: string) => {
    setSearchValue(newValue);
  };

  const handleChange = (selectedOption: any) => {
    onSelect && onSelect(selectedOption);
  };

  const options = userProfiles.map((profile) => ({
    fid: profile.fid,
    label: profile.display_name,
    pfp_url: profile.pfp_url,
  }));

  const formatOptionLabel = ({ value, label, pfp_url }: any) => (
    <div className="flex items-center">
      <img className="w-8 h-8 mr-2" src={pfp_url} alt="profile" />
      <span>{label}</span>
    </div>
  );

  return (
    <Select
      styles={customStyles}
      value={value}
      options={options as any}
      onInputChange={handleInputChange}
      onChange={handleChange}
      formatOptionLabel={formatOptionLabel}
      isClearable
      placeholder="Search user..."
      isLoading={isLoading}
    />
  );
};

export default FarcasterUserSelector;
