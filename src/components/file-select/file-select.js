import { Form } from "react-bootstrap";

const { Control, Label } = Form;

export const FileSelect = ({ label, onChange }) => {
  const handleChange = evt => {
    const file = evt.target.files.length === 1 ? evt.target.files[0] : null;

    onChange(file);
  };

  return (
    <>
      <Label className="text-muted">{ label }</Label>
      <Control
        type="file"       
        onChange={ handleChange }
      />
    </>
  );
};           