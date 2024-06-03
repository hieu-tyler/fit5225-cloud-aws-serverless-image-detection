import { useRouter } from "next/navigation";

const MyButton: React.FC<{ destination: string }> = ({ destination }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(destination);
  };

  return <button onClick={handleClick}>Go to {destination}</button>;
};

export default MyButton;
