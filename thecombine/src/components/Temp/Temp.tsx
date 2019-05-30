import * as React from 'react';
import './Temp.css';

//interface for component props
export interface TempProps {
    text: string
    buttonClicked?: () => void;
}

//interface for component state
interface State {
    nothink: string;
}

class Temp extends React.Component<TempProps, State> {
    constructor(props: TempProps) {
        super(props);
        this.state = {nothink: ""}    
    }

    //defining method calls as properties
    buttonClicked = () => this.pressButton();

    render() {
        //extract text from props
        const {text} = this.props;

        //visual definition
        return (
            <div className="temp">
                {text} was passed into this test object.
                <button onClick={this.buttonClicked}>{this.props.text}</button>
            </div>
        )
    }

    pressButton()
    {
        console.log("Button Pressed")
    }
}

//export class as default
export default Temp;

